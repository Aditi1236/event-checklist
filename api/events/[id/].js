import {
  getEventsCollection,
  jsonRes,
  requireAdmin,
  requireAuth,
  addTaskDefaults,
  normalizeTaskPatch,
} from "../../_lib/events.js";
import { handleOptions } from "../../_lib/auth.js";

export default async function handler(req, params) {
  if (req.method === "OPTIONS") return handleOptions();
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const eventId = params?.id || decodeURIComponent(pathParts[2] || "");
    const events = await getEventsCollection();

    // Handle /api/events/:id/tasks
    if (pathParts[3] === "tasks") {
      if (pathParts.length === 4 && req.method === "POST") {
        const admin = await requireAdmin(req);
        if (!admin) return jsonRes(403, { error: "Admin access required" });
        const body = await req.json();
        const task = addTaskDefaults(body);
        const result = await events.updateOne({ id: eventId }, { $push: { tasks: task } });
        if (result.matchedCount === 0) return jsonRes(404, { error: "Event not found" });
        return jsonRes(201, task);
      }

      if (pathParts.length === 5) {
        const taskId = decodeURIComponent(pathParts[4]);
        const event = await events.findOne({ id: eventId });
        if (!event) return jsonRes(404, { error: "Event not found" });
        const task = event.tasks?.find((t) => t.id === taskId);
        if (!task) return jsonRes(404, { error: "Task not found" });

        if (req.method === "PUT") {
          const user = await requireAuth(req);
          if (!user) return jsonRes(401, { error: "Authentication required" });
          const body = await req.json();
          let patch;
          if (user.role === "admin") {
            patch = normalizeTaskPatch(body, task);
          } else {
            if (task.assigneeId !== user.id) return jsonRes(403, { error: "You can only update tasks assigned to you" });
            const allowed = {};
            if (body.status !== undefined) allowed.status = body.status;
            if (body.completed !== undefined) allowed.completed = body.completed;
            if (Object.keys(allowed).length === 0) return jsonRes(403, { error: "Members can only update the status of their tasks" });
            patch = normalizeTaskPatch(allowed, task);
          }
          const updated = { ...task, ...patch, updatedAt: Date.now() };
          await events.updateOne({ id: eventId, "tasks.id": taskId }, { $set: { "tasks.$": updated } });
          return jsonRes(200, updated);
        }

        if (req.method === "DELETE") {
          const admin = await requireAdmin(req);
          if (!admin) return jsonRes(403, { error: "Admin access required" });
          await events.updateOne({ id: eventId }, { $pull: { tasks: { id: taskId } } });
          return jsonRes(200, { ok: true });
        }
      }
      return jsonRes(405, { error: "Method not allowed" });
    }

    // Handle /api/events/:id
    const event = await events.findOne({ id: eventId });
    if (!event) return jsonRes(404, { error: "Event not found" });

    if (req.method === "GET") return jsonRes(200, event);

    if (req.method === "PUT") {
      const admin = await requireAdmin(req);
      if (!admin) return jsonRes(403, { error: "Admin access required" });
      const patch = await req.json();
      await events.updateOne({ id: eventId }, { $set: patch });
      const updated = await events.findOne({ id: eventId });
      return jsonRes(200, updated);
    }

    if (req.method === "DELETE") {
      const admin = await requireAdmin(req);
      if (!admin) return jsonRes(403, { error: "Admin access required" });
      await events.deleteOne({ id: eventId });
      return jsonRes(200, { ok: true });
    }

    return jsonRes(405, { error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return jsonRes(500, { error: "Internal server error" });
  }
}
