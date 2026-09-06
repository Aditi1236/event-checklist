import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import {
  connectDB,
  getEventsCollection,
  getUsersCollection,
  ensureDefaultAdmin,
  verifyPassword,
  hashPassword,
  publicUser,
} from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "..", "dist");
const PORT = process.env.PORT || 4000;
const AUTH_SECRET = process.env.AUTH_SECRET || "nexasoul-dev-secret-change-me";
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const TASK_STATUS = ["pending", "in_progress", "completed"];
const EVENT_TYPES = ["event", "bootcamp"];
const USER_ROLES = ["admin", "member"];

/* ── Real-time clients (Server-Sent Events) ──── */
const sseClients = new Set();

function broadcastChange() {
  const payload = `data: ${JSON.stringify({ type: "update", ts: Date.now() })}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch {
      sseClients.delete(res);
    }
  }
}

function genId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ── HTTP helpers ──────────────────────────────── */
function send(res, status, body) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  res.writeHead(status, headers);
  res.end(body === undefined ? "" : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

/* ── Auth helpers ──────────────────────────────── */
function signToken(user) {
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + TOKEN_TTL_MS,
    })
  ).toString("base64url");
  const sig = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

function verifyToken(token) {
  const [payload, sig] = String(token || "").split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", AUTH_SECRET).update(payload).digest("base64url");
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  try {
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!claims.sub || Date.now() > claims.exp) return null;
    return claims;
  } catch {
    return null;
  }
}

async function getUserFromReq(req) {
  const auth = req.headers.authorization || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  const claims = verifyToken(token);
  if (!claims) return null;
  const users = getUsersCollection();
  const user = await users.findOne({ id: claims.sub });
  if (!user || user.status === "inactive") return null;
  return user;
}

async function requireAuth(req, res) {
  const user = await getUserFromReq(req);
  if (!user) {
    send(res, 401, { error: "Authentication required" });
    return null;
  }
  return user;
}

async function requireAdmin(req, res) {
  const user = await requireAuth(req, res);
  if (!user) return null;
  if (user.role !== "admin") {
    send(res, 403, { error: "Admin access required" });
    return null;
  }
  return user;
}

/* ── Task normalization (status ⇄ completed) ──── */
function addTaskDefaults(body) {
  const status = TASK_STATUS.includes(body.status) ? body.status : "pending";
  return {
    id: body.id || genId("task"),
    title: String(body.title ?? "").trim(),
    description: String(body.description ?? ""),
    category: body.category ?? "before",
    dueDate: body.dueDate ?? "",
    priority: body.priority ?? "medium",
    status,
    completed: status === "completed" || Boolean(body.completed),
    assigneeId: body.assigneeId || null,
    createdAt: body.createdAt ?? Date.now(),
  };
}

function normalizeTaskPatch(patch, existingTask = {}) {
  const next = {};
  if (patch.title !== undefined) next.title = String(patch.title).trim();
  if (patch.description !== undefined) next.description = String(patch.description);
  if (patch.category !== undefined) next.category = patch.category;
  if (patch.dueDate !== undefined) next.dueDate = patch.dueDate ?? "";
  if (patch.priority !== undefined) next.priority = patch.priority;
  if (patch.assigneeId !== undefined) next.assigneeId = patch.assigneeId || null;

  const currentStatus = existingTask.status ?? (existingTask.completed ? "completed" : "pending");
  if (patch.status !== undefined && TASK_STATUS.includes(patch.status)) {
    next.status = patch.status;
    next.completed = patch.status === "completed";
  } else if (patch.completed !== undefined) {
    next.completed = Boolean(patch.completed);
    if (next.completed) next.status = "completed";
    else next.status = currentStatus === "completed" ? "pending" : currentStatus;
  }
  return next;
}
/* ── Task/event aggregation helpers ───────────── */
async function flattenAllTasks() {
  const events = getEventsCollection();
  const all = await events.find({}).toArray();
  const list = [];
  for (const evt of all) {
    for (const task of evt.tasks ?? []) {
      list.push({ ...task, eventId: evt.id, eventName: evt.name });
    }
  }
  return list;
}

async function getAdminSummary() {
  const events = getEventsCollection();
  const users = getUsersCollection();
  const [allEvents, allUsers] = await Promise.all([events.find({}).toArray(), users.find({}).toArray()]);

  let total = 0,
    pending = 0,
    inProgress = 0,
    done = 0;
  const eventProgress = allEvents.map((evt) => {
    const tasks = evt.tasks ?? [];
    const t = tasks.length;
    const d = tasks.filter((x) => x.completed || x.status === "completed").length;
    total += t;
    done += d;
    pending += tasks.filter((x) => (x.status ?? (x.completed ? "completed" : "pending")) === "pending").length;
    inProgress += tasks.filter((x) => x.status === "in_progress").length;
    return {
      id: evt.id,
      name: evt.name,
      type: evt.type || "event",
      date: evt.date,
      location: evt.location,
      total: t,
      done: d,
      pct: t === 0 ? 0 : Math.round((d / t) * 100),
    };
  });

  const memberLoad = allUsers.map((u) => {
    const assigned = allEvents.flatMap((e) => e.tasks ?? []).filter((t) => t.assigneeId === u.id);
    return {
      userId: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      position: u.position,
      total: assigned.length,
      pending: assigned.filter((t) => (t.status ?? "pending") === "pending").length,
      inProgress: assigned.filter((t) => t.status === "in_progress").length,
      completed: assigned.filter((t) => t.completed || t.status === "completed").length,
    };
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = allEvents
    .filter((e) => e.date && new Date(`${e.date}T00:00:00`) >= today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5)
    .map((e) => ({
      id: e.id,
      name: e.name,
      type: e.type || "event",
      date: e.date,
      location: e.location,
    }));

  return {
    events: allEvents.length,
    members: allUsers.filter((u) => u.role !== "admin").length,
    admins: allUsers.filter((u) => u.role === "admin").length,
    tasks: { total, pending, inProgress, completed: done },
    overallProgress: total === 0 ? 0 : Math.round((done / total) * 100),
    eventProgress,
    memberLoad,
    upcoming,
  };
}

const MIME = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".json": "application/json",
};

function serveStatic(req, res) {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);
  if (urlPath === "/") urlPath = "/index.html";
  const filePath = path.join(DIST_DIR, urlPath);
  if (!filePath.startsWith(DIST_DIR) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const indexFile = path.join(DIST_DIR, "index.html");
    if (fs.existsSync(indexFile)) {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(fs.readFileSync(indexFile));
    } else {
      send(res, 404, { error: "Not found" });
    }
    return;
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
  res.end(fs.readFileSync(filePath));
}
/* ── API (MongoDB-backed with JSON fallback) ───── */
async function handleApi(req, res, url) {
  const parts = url.pathname.split("/").filter(Boolean);
  const events = getEventsCollection();
  const users = getUsersCollection();

  /* ── /api/auth ─────────────────────────────── */
  if (parts[1] === "auth" && parts.length === 3) {
    if (parts[2] === "login" && req.method === "POST") {
      const body = await readBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password ?? "").trim();
      if (!email || !password) return send(res, 400, { error: "Email and password are required" });
      const user = await users.findOne({ email });
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return send(res, 401, { error: "Invalid email or password" });
      }
      if (user.status === "inactive") return send(res, 403, { error: "This account has been deactivated" });
      return send(res, 200, { token: signToken(user), user: publicUser(user) });
    }

    if (parts[2] === "signup" && req.method === "POST") {
      const body = await readBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password ?? "").trim();
      const name = String(body.name || "").trim();
      const role = USER_ROLES.includes(body.role) ? body.role : "member";
      const securityQuestion = String(body.securityQuestion || "").trim();
      const securityAnswer = String(body.securityAnswer || "").trim().toLowerCase();
      
      if (!name || !email || !password || !securityQuestion || !securityAnswer) {
        return send(res, 400, { error: "Name, email, password, and security question are required" });
      }
      if (password.length < 6) return send(res, 400, { error: "Password must be at least 6 characters" });
      
      if (role === "admin") {
        const adminCount = await users.countDocuments({ role: "admin" });
        if (adminCount >= 2) {
          return send(res, 403, { error: "Maximum of 2 admins allowed." });
        }
      }

      const dup = await users.findOne({ email });
      if (dup) return send(res, 409, { error: "An account with this email already exists" });
      
      const newUser = {
        id: genId("usr"),
        name,
        email,
        passwordHash: hashPassword(password),
        role,
        securityQuestion,
        securityAnswer,
        position: "",
        phone: "",
        status: "active",
        createdAt: Date.now(),
      };
      await users.insertOne(newUser);
      broadcastChange();
      return send(res, 201, { token: signToken(newUser), user: publicUser(newUser) });
    }

    if (parts[2] === "get-security-question" && req.method === "POST") {
      const body = await readBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      if (!email) return send(res, 400, { error: "Email is required" });
      const user = await users.findOne({ email });
      if (!user) return send(res, 404, { error: "No account found with this email" });
      if (!user.securityQuestion) return send(res, 400, { error: "This account does not have a security question set up" });
      return send(res, 200, { question: user.securityQuestion });
    }

    if (parts[2] === "reset-password" && req.method === "POST") {
      const body = await readBody(req);
      const email = String(body.email || "").trim().toLowerCase();
      const answer = String(body.answer || "").trim().toLowerCase();
      const newPassword = String(body.newPassword || "").trim();
      
      if (!email || !answer || !newPassword) return send(res, 400, { error: "All fields are required" });
      if (newPassword.length < 6) return send(res, 400, { error: "Password must be at least 6 characters" });
      
      const user = await users.findOne({ email });
      if (!user) return send(res, 404, { error: "No account found with this email" });
      if (user.securityAnswer !== answer) return send(res, 401, { error: "Incorrect answer to security question" });
      
      await users.updateOne({ id: user.id }, { $set: { passwordHash: hashPassword(newPassword) } });
      return send(res, 200, { ok: true });
    }

    if (parts[2] === "me") {
      if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });
      const user = await requireAuth(req, res);
      if (!user) return;
      return send(res, 200, publicUser(user));
    }

    if (parts[2] === "logout" && req.method === "POST") {
      return send(res, 200, { ok: true });
    }
  }

  /* ── /api/users (admin only) ────────────────── */
  if (parts[1] === "users") {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    if (parts.length === 2) {
      if (req.method === "GET") {
        const all = await users.find({}).sort({ createdAt: -1 }).toArray();
        return send(res, 200, all.map(publicUser));
      }
      if (req.method === "POST") {
        const body = await readBody(req);
        const email = String(body.email || "").trim().toLowerCase();
        if (!body.name?.trim() || !email) return send(res, 400, { error: "Name and email are required" });
        if (!body.password || String(body.password).length < 6) {
          return send(res, 400, { error: "Password must be at least 6 characters" });
        }
        const dup = await users.findOne({ email });
        if (dup) return send(res, 409, { error: "An account with this email already exists" });
        const role = USER_ROLES.includes(body.role) ? body.role : "member";
        const newUser = {
          id: body.id || genId("usr"),
          name: String(body.name).trim(),
          email,
          passwordHash: hashPassword(body.password),
          role,
          position: String(body.position || "").trim(),
          phone: String(body.phone || "").trim(),
          status: body.status === "inactive" ? "inactive" : "active",
          createdAt: Date.now(),
        };
        await users.insertOne(newUser);
        broadcastChange();
        return send(res, 201, publicUser(newUser));
      }
      return send(res, 405, { error: "Method not allowed" });
    }

    if (parts.length === 3) {
      const userId = decodeURIComponent(parts[2]);
      if (req.method === "PUT") {
        const existing = await users.findOne({ id: userId });
        if (!existing) return send(res, 404, { error: "User not found" });
        const body = await readBody(req);
        const patch = {
          name: body.name !== undefined ? String(body.name).trim() : existing.name,
          email: body.email !== undefined ? String(body.email).trim().toLowerCase() : existing.email,
          role: body.role !== undefined && USER_ROLES.includes(body.role) ? body.role : existing.role,
          position: body.position !== undefined ? String(body.position).trim() : existing.position,
          phone: body.phone !== undefined ? String(body.phone).trim() : existing.phone,
          status: body.status !== undefined ? body.status : existing.status,
        };
        if (patch.email && patch.email !== existing.email) {
          const dup = await users.findOne({ email: patch.email });
          if (dup) return send(res, 409, { error: "Another account already uses this email" });
        }
        if (existing.role === "admin" && (patch.role !== "admin" || patch.status === "inactive")) {
          const otherAdmins = await users.countDocuments({ role: "admin", status: "active" });
          if (existing.id === admin.id && otherAdmins <= 1) {
            return send(res, 400, { error: "You cannot demote or deactivate your own account" });
          }
        }
        if (body.newPassword && String(body.newPassword).length >= 6) {
          patch.passwordHash = hashPassword(body.newPassword);
        }
        await users.updateOne({ id: userId }, { $set: patch });
        broadcastChange();
        const updated = await users.findOne({ id: userId });
        return send(res, 200, publicUser(updated));
      }
      if (req.method === "DELETE") {
        const existing = await users.findOne({ id: userId });
        if (!existing) return send(res, 404, { error: "User not found" });
        if (existing.id === admin.id) return send(res, 400, { error: "You cannot delete your own account" });
        if (existing.role === "admin") {
          const admins = await users.countDocuments({ role: "admin" });
          if (admins <= 1) return send(res, 400, { error: "Cannot delete the last admin account" });
        }
        await users.deleteOne({ id: userId });
        broadcastChange();
        return send(res, 200, { ok: true });
      }
      return send(res, 405, { error: "Method not allowed" });
    }
  }
/* ── /api/tasks (admin only, flattened) ─────── */
  if (parts.length === 2 && parts[1] === "tasks") {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });
    const { status = "", assignee = "", eventId = "" } = Object.fromEntries(url.searchParams);
    let list = await flattenAllTasks();
    if (status) list = list.filter((t) => (t.status ?? "pending") === status);
    if (assignee) list = list.filter((t) => t.assigneeId === assignee);
    if (eventId) list = list.filter((t) => t.eventId === eventId);
    list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return send(res, 200, list);
  }

  /* ── /api/admin/summary (admin only) ────────── */
  if (parts.length === 3 && parts[1] === "admin" && parts[2] === "summary") {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });
    return send(res, 200, await getAdminSummary());
  }

  /* ── /api/my/tasks (current user's assigned tasks) ── */
  if (parts.length === 3 && parts[1] === "my" && parts[2] === "tasks") {
    const user = await requireAuth(req, res);
    if (!user) return;
    if (req.method !== "GET") return send(res, 405, { error: "Method not allowed" });
    const all = await events.find({}).toArray();
    const list = [];
    for (const evt of all) {
      for (const t of evt.tasks ?? []) {
        if (t.assigneeId !== user.id) continue;
        list.push({
          ...t,
          eventId: evt.id,
          eventName: evt.name,
          eventType: evt.type || "event",
          eventDate: evt.date || "",
          eventEndDate: evt.endDate || "",
          eventLocation: evt.location || "",
          eventDescription: evt.description || "",
        });
      }
    }
    list.sort((a, b) => {
      const done = (t) => (t.status === "completed" || t.completed ? 1 : 0);
      if (done(a) !== done(b)) return done(a) - done(b); // open tasks first
      if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });
    return send(res, 200, list);
  }

  /* ── /api/events ────────────────────────────── */
  if (parts.length === 2 && parts[1] === "events") {
    if (req.method === "GET") {
      const all = await events.find({}).sort({ createdAt: -1 }).toArray();
      return send(res, 200, all);
    }
    if (req.method === "POST") {
      const admin = await requireAdmin(req, res);
      if (!admin) return;
      const body = await readBody(req);
      const type = EVENT_TYPES.includes(body.type) ? body.type : "event";
      const event = {
        id: body.id || genId("evt"),
        name: body.name ?? "",
        type,
        date: body.date ?? "",
        endDate: body.endDate ?? "",
        duration: String(body.duration || "").trim(),
        category: String(body.category || "").trim(),
        description: body.description ?? "",
        location: body.location ?? "",
        mode: body.mode ?? "",
        capacity: Number(body.capacity) || 0,
        techStack: String(body.techStack || "").trim(),
        budget: Number(body.budget) || 0,
        registrations: Number(body.registrations) || 0,
        teamMembers: body.teamMembers ?? "",
        speakers: String(body.speakers || "").trim(),
        collaborators: String(body.collaborators || "").trim(),
        learningOutcomes: String(body.learningOutcomes || "").trim(),
        studentBenefits: String(body.studentBenefits || "").trim(),
        targetAudience: String(body.targetAudience || "").trim(),
        prerequisites: String(body.prerequisites || "").trim(),
        registrationLink: String(body.registrationLink || "").trim(),
        highlights: String(body.highlights || "").trim(),
        tasks: Array.isArray(body.tasks) ? body.tasks : [],
        createdAt: body.createdAt ?? Date.now(),
      };
      await events.insertOne(event);
      broadcastChange();
      return send(res, 201, event);
    }
    return send(res, 405, { error: "Method not allowed" });
  }
// Any /api/events/... nested route
  if (parts[0] === "api" && parts[1] === "events" && parts.length >= 3) {
    const eventId = decodeURIComponent(parts[2]);

    // /api/events/:id/tasks (POST)
    if (parts[3] === "tasks" && parts.length === 4) {
      if (req.method === "POST") {
        const admin = await requireAdmin(req, res);
        if (!admin) return;
        const body = await readBody(req);
        const task = addTaskDefaults(body);
        const result = await events.updateOne({ id: eventId }, { $push: { tasks: task } });
        if (result.matchedCount === 0) return send(res, 404, { error: "Event not found" });
        broadcastChange();
        return send(res, 201, task);
      }
      return send(res, 405, { error: "Method not allowed" });
    }

    // /api/events/:id/tasks/:taskId
    if (parts[3] === "tasks" && parts.length === 5) {
      const taskId = decodeURIComponent(parts[4]);
      const event = await events.findOne({ id: eventId });
      if (!event) return send(res, 404, { error: "Event not found" });
      const task = event.tasks?.find((t) => t.id === taskId);
      if (!task) return send(res, 404, { error: "Task not found" });

      if (req.method === "PUT") {
        const user = await requireAuth(req, res);
        if (!user) return;
        const body = await readBody(req);

        let patch;
        if (user.role === "admin") {
          // Admins have full control over any task.
          patch = normalizeTaskPatch(body, task);
        } else {
          // Executive members may only move their OWN tasks forward,
          // and only the status/completed fields.
          if (task.assigneeId !== user.id) {
            return send(res, 403, { error: "You can only update tasks assigned to you" });
          }
          const allowed = {};
          if (body.status !== undefined) allowed.status = body.status;
          if (body.completed !== undefined) allowed.completed = body.completed;
          if (Object.keys(allowed).length === 0) {
            return send(res, 403, { error: "Members can only update the status of their tasks" });
          }
          patch = normalizeTaskPatch(allowed, task);
        }

        const updated = { ...task, ...patch, updatedAt: Date.now() };
        await events.updateOne({ id: eventId, "tasks.id": taskId }, { $set: { "tasks.$": updated } });
        broadcastChange();
        return send(res, 200, updated);
      }
      if (req.method === "DELETE") {
        const admin = await requireAdmin(req, res);
        if (!admin) return;
        await events.updateOne({ id: eventId }, { $pull: { tasks: { id: taskId } } });
        broadcastChange();
        return send(res, 200, { ok: true });
      }
      return send(res, 405, { error: "Method not allowed" });
    }

    // /api/events/:id
    if (parts.length === 3) {
      const event = await events.findOne({ id: eventId });
      if (!event) return send(res, 404, { error: "Event not found" });
      if (req.method === "GET") return send(res, 200, event);
      if (req.method === "PUT") {
        const admin = await requireAdmin(req, res);
        if (!admin) return;
        const patch = await readBody(req);
        if (patch.type !== undefined && patch.type !== event.type) {
          patch.type = EVENT_TYPES.includes(patch.type) ? patch.type : "event";
        }
        await events.updateOne({ id: eventId }, { $set: patch });
        broadcastChange();
        const updated = await events.findOne({ id: eventId });
        return send(res, 200, updated);
      }
      if (req.method === "DELETE") {
        const admin = await requireAdmin(req, res);
        if (!admin) return;
        await events.deleteOne({ id: eventId });
        broadcastChange();
        return send(res, 200, { ok: true });
      }
      return send(res, 405, { error: "Method not allowed" });
    }
  }

  return send(res, 404, { error: "Route not found" });
}

/* ── Server ──────────────────────────────────────── */
const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204);
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api")) {
    // Real-time stream: push a notification to every connected client
    // whenever any event/task/user changes.
    if (url.pathname === "/api/events/stream") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      });
      res.write("retry: 3000\n\n");
      res.write(": connected\n\n");
      sseClients.add(res);
      const ping = setInterval(() => {
        try {
          res.write(": ping\n\n");
        } catch {
          clearInterval(ping);
          sseClients.delete(res);
        }
      }, 25000);
      req.on("close", () => {
        clearInterval(ping);
        sseClients.delete(res);
      });
      return;
    }
    try {
      return await handleApi(req, res, url);
    } catch (err) {
      console.error(err);
      return send(res, 500, { error: "Internal server error" });
    }
  }
  return serveStatic(req, res);
});

connectDB()
  .then(() => ensureDefaultAdmin())
  .then((admin) => {
    console.log(`👤 Current admin: ${admin.email} (${admin.id})`);
    console.log(`🔑 Logins  →  Admin: admin@nexasoul.com / admin123   |   Member: member@nexasoul.com / member123`);
    server.listen(PORT, () => {
      console.log(`✅ Backend running at http://localhost:${PORT}`);
      console.log(`   API:      http://localhost:${PORT}/api/events`);
      console.log(`   Login:    POST /api/auth/login`);
      console.log(`   Summary:  GET  /api/admin/summary`);
      console.log(`   Live sync: http://localhost:${PORT}/api/events/stream`);
    });
  })
  .catch((err) => {
    console.error("Failed to boot:", err);
    process.exit(1);
  });

// Close open SSE connections on shutdown
function shutdown() {
  for (const res of sseClients) {
    try {
      res.end();
    } catch {
      /* ignore */
    }
  }
  sseClients.clear();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);