import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "data", "events.json");
const DIST_DIR = path.join(__dirname, "..", "dist");
const PORT = process.env.PORT || 4000;

/* ── JSON file store ─────────────────────────────── */
function readData() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeData(data) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function genId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/* ── Helpers ─────────────────────────────────────── */
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

/* ── API ─────────────────────────────────────────── */
async function handleApi(req, res, url) {
  const parts = url.pathname.split("/").filter(Boolean); // ["api", "events", ":id", ...]
  const events = readData();

  // /api/events
  if (parts.length === 2 && parts[1] === "events") {
    if (req.method === "GET") return send(res, 200, events);
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
      events.push(event);
      writeData(events);
      return send(res, 201, event);
    }
  }

  // /api/events/:id  and  /api/events/:id/tasks...
  if (parts.length >= 3 && parts[1] === "events") {
    const eventId = parts[2];
    const event = events.find((e) => e.id === eventId);
    if (!event) return send(res, 404, { error: "Event not found" });

    // /api/events/:id/tasks
    if (parts.length === 4 && parts[3] === "tasks") {
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
        event.tasks.push(task);
        writeData(events);
        return send(res, 201, task);
      }
    }

    // /api/events/:id/tasks/:taskId
    if (parts.length === 5 && parts[3] === "tasks") {
      const taskId = parts[4];
      const task = event.tasks.find((t) => t.id === taskId);
      if (!task) return send(res, 404, { error: "Task not found" });
      if (req.method === "PUT") {
        const patch = await readBody(req);
        Object.assign(task, patch);
        writeData(events);
        return send(res, 200, task);
      }
      if (req.method === "DELETE") {
        event.tasks = event.tasks.filter((t) => t.id !== taskId);
        writeData(events);
        return send(res, 200, { ok: true });
      }
    }

    // /api/events/:id
    if (parts.length === 3) {
      if (req.method === "GET") return send(res, 200, event);
      if (req.method === "PUT") {
        const patch = await readBody(req);
        Object.assign(event, patch);
        writeData(events);
        return send(res, 200, event);
      }
      if (req.method === "DELETE") {
        writeData(events.filter((e) => e.id !== eventId));
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

server.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/events`);
});
