import {
  getUsersCollection,
  getEventsCollection,
  jsonRes,
  requireAuth,
  requireAdmin,
  publicUser,
  handleOptions,
} from "./_lib/auth.js";

export default async function handler(req, params) {
  if (req.method === "OPTIONS") return handleOptions();

  const slug = params?.slug;
  const parts = Array.isArray(slug) ? slug : [slug];

  try {
    /* ── /api/tasks (admin) ── */
    if (parts[0] === "tasks" && parts.length === 1 && req.method === "GET") {
      const admin = await requireAdmin(req);
      if (!admin) return jsonRes(403, { error: "Admin access required" });
      const url = new URL(req.url);
      const status = url.searchParams.get("status") || "";
      const assignee = url.searchParams.get("assignee") || "";
      const eventId = url.searchParams.get("eventId") || "";
      const events = await getEventsCollection();
      const all = await events.find({}).toArray();
      let list = [];
      for (const evt of all) {
        for (const t of evt.tasks ?? []) {
          list.push({ ...t, eventId: evt.id, eventName: evt.name });
        }
      }
      if (status) list = list.filter((t) => (t.status ?? "pending") === status);
      if (assignee) list = list.filter((t) => t.assigneeId === assignee);
      if (eventId) list = list.filter((t) => t.eventId === eventId);
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return jsonRes(200, list);
    }

    /* ── /api/admin/summary ── */
    if (parts[0] === "admin" && parts[1] === "summary" && req.method === "GET") {
      const admin = await requireAdmin(req);
      if (!admin) return jsonRes(403, { error: "Admin access required" });
      const events = await getEventsCollection();
      const db = await getDb();
      const usersCollection = db.collection("users");
      const [allEvents, allUsers] = await Promise.all([
        events.find({}).toArray(),
        usersCollection.find({}).toArray(),
      ]);
      let total = 0, pending = 0, inProgress = 0, done = 0;
      const eventProgress = allEvents.map((evt) => {
        const tasks = evt.tasks ?? [];
        const t = tasks.length;
        const d = tasks.filter((x) => x.completed || x.status === "completed").length;
        total += t; done += d;
        pending += tasks.filter((x) => (x.status ?? (x.completed ? "completed" : "pending")) === "pending").length;
        inProgress += tasks.filter((x) => x.status === "in_progress").length;
        return { id: evt.id, name: evt.name, type: evt.type || "event", date: evt.date, location: evt.location, total: t, done: d, pct: t === 0 ? 0 : Math.round((d / t) * 100) };
      });
      const memberLoad = allUsers.map((u) => {
        const assigned = allEvents.flatMap((e) => e.tasks ?? []).filter((t) => t.assigneeId === u.id);
        return { userId: u.id, name: u.name, email: u.email, role: u.role, position: u.position, total: assigned.length, pending: assigned.filter((t) => (t.status ?? "pending") === "pending").length, inProgress: assigned.filter((t) => t.status === "in_progress").length, completed: assigned.filter((t) => t.completed || t.status === "completed").length };
      });
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const upcoming = allEvents.filter((e) => e.date && new Date(`${e.date}T00:00:00`) >= today).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(0, 5).map((e) => ({ id: e.id, name: e.name, type: e.type || "event", date: e.date, location: e.location }));
      return jsonRes(200, { events: allEvents.length, members: allUsers.filter((u) => u.role !== "admin").length, admins: allUsers.filter((u) => u.role === "admin").length, tasks: { total, pending, inProgress, completed: done }, overallProgress: total === 0 ? 0 : Math.round((done / total) * 100), eventProgress, memberLoad, upcoming });
    }

    /* ── /api/my/tasks ── */
    if (parts[0] === "my" && parts[1] === "tasks" && req.method === "GET") {
      const user = await requireAuth(req);
      if (!user) return jsonRes(401, { error: "Authentication required" });
      const events = await getEventsCollection();
      const all = await events.find({}).toArray();
      const list = [];
      for (const evt of all) {
        for (const t of evt.tasks ?? []) {
          if (t.assigneeId !== user.id) continue;
          list.push({ ...t, eventId: evt.id, eventName: evt.name, eventType: evt.type || "event", eventDate: evt.date || "", eventEndDate: evt.endDate || "", eventLocation: evt.location || "", eventDescription: evt.description || "" });
        }
      }
      list.sort((a, b) => { const done = (t) => (t.status === "completed" || t.completed ? 1 : 0); if (done(a) !== done(b)) return done(a) - done(b); if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate); if (a.dueDate) return -1; if (b.dueDate) return 1; return (b.createdAt || 0) - (a.createdAt || 0); });
      return jsonRes(200, list);
    }

    return jsonRes(404, { error: "Route not found" });
  } catch (err) {
    console.error(err);
    return jsonRes(500, { error: "Internal server error" });
  }
}

// Helper to get DB
import { getDb } from "./_lib/auth.js";
