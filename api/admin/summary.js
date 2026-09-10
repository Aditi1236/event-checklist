import { getDb, jsonRes, requireAdmin, handleOptions } from "../_lib/auth.js";
import { getEventsCollection } from "../_lib/events.js";

export default async function handler(req) {
  if (req.method === "OPTIONS") return handleOptions();
  try {
    if (req.method !== "GET") {
      return jsonRes(405, { error: "Method not allowed" });
    }

    const admin = await requireAdmin(req);
    if (!admin) return jsonRes(403, { error: "Admin access required" });

    const events = await getEventsCollection();
    const db = await getDb();
    const usersCollection = db.collection("users");

    const [allEvents, allUsers] = await Promise.all([
      events.find({}).toArray(),
      usersCollection.find({}).toArray(),
    ]);

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

    return jsonRes(200, {
      events: allEvents.length,
      members: allUsers.filter((u) => u.role !== "admin").length,
      admins: allUsers.filter((u) => u.role === "admin").length,
      tasks: { total, pending, inProgress, completed: done },
      overallProgress: total === 0 ? 0 : Math.round((done / total) * 100),
      eventProgress,
      memberLoad,
      upcoming,
    });
  } catch (err) {
    console.error(err);
    return jsonRes(500, { error: "Internal server error" });
  }
}
