import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDB, getEventsCollection } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, "..", "dist");
const PORT = process.env.PORT || 4000;

function genId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ── HTTP helpers ──────────────────────────────── */
function send(res, status, body) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
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

/* ── API (MongoDB-backed) ──────────────────────── */
async function handleApi(req, res, url) {
  const parts = url.pathname.split("/").filter(Boolean); // ["api", "events", ":id", ...]
  const events = getEventsCollection();

  // /api/events
  if (parts.length === 2 && parts[1] === "events") {
    if (req.method === "GET") {
      const all = await events.find({}).sort({ createdAt: -1 }).toArray();
      return send(res, 200, all);
    }
    if (req.method === "POST") {
      const body = await readBody(req);
      const event = {
        id: body.id || genId("evt"),
        name: body.name ?? "",
        date: body.date ?? "",
        description: body.description ?? "",
        location: body.location ?? "",
        budget: Number(body.budget) || 0,
        registrations: Number(body.registrations) || 0,
        teamMembers: body.teamMembers ?? "",
        tasks: Array.isArray(body.tasks) ? body.tasks : [],
        createdAt: body.createdAt ?? Date.now(),
      };
      await events.insertOne(event);
      return send(res, 201, event);
    }
  }

  // /api/events/:id  and  /api/events/:id/tasks...
  if (parts.length >= 3 && parts[1] === "events") {
    const eventId = parts[2];

    // /api/events/:id/tasks
    if (parts.length === 4 && parts[3] === "tasks") {
      const event = await events.findOne({ id: eventId });
      if (!event) return send(res, 404, { error: "Event not found" });
      if (req.method === "POST") {
        const body = await readBody(req);
        const task = {
          id: body.id || genId("task"),
          title: body.title ?? "",
          description: body.description ?? "",
          category: body.category ?? "before",
          dueDate: body.dueDate ?? "",
          priority: body.priority ?? "medium",
          completed: Boolean(body.completed),
          createdAt: body.createdAt ?? Date.now(),
        };
        await events.updateOne({ id: eventId }, { $push: { tasks: task } });
        return send(res, 201, task);
      }
    }

    // /api/events/:id/tasks/:taskId
    if (parts.length === 5 && parts[3] === "tasks") {
      const taskId = parts[4];
      const event = await events.findOne({ id: eventId });
      if (!event) return send(res, 404, { error: "Event not found" });
      const task = event.tasks?.find((t) => t.id === taskId);
      if (!task) return send(res, 404, { error: "Task not found" });
      if (req.method === "PUT") {
        const patch = await readBody(req);
        const updated = { ...task, ...patch };
        await events.updateOne(
          { id: eventId, "tasks.id": taskId },
          { $set: { "tasks.$": updated } }
        );
        return send(res, 200, updated);
      }
      if (req.method === "DELETE") {
        await events.updateOne({ id: eventId }, { $pull: { tasks: { id: taskId } } });
        return send(res, 200, { ok: true });
      }
    }

    // /api/events/:id
    if (parts.length === 3) {
      const event = await events.findOne({ id: eventId });
      if (!event) return send(res, 404, { error: "Event not found" });
      if (req.method === "GET") return send(res, 200, event);
      if (req.method === "PUT") {
        const patch = await readBody(req);
        await events.updateOne({ id: eventId }, { $set: patch });
        const updated = await events.findOne({ id: eventId });
        return send(res, 200, updated);
      }
      if (req.method === "DELETE") {
        await events.deleteOne({ id: eventId });
        return send(res, 200, { ok: true });
      }
    }
  }

  return send(res, 404, { error: "Route not found" });
}

/* ── Server ──────────────────────────────────────── */
const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 204);
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api")) {
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
  .then(() => {
    server.listen(PORT, () => {
      console.log(`✅ Backend running at http://localhost:${PORT}`);
      console.log(`   API: http://localhost:${PORT}/api/events`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:");
    console.error(err.message);
    console.error("\nMake sure MongoDB is running and MONGODB_URI is set (see .env).");
    process.exit(1);
  });
