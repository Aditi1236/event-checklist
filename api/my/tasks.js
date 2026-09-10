import { getEventsCollection, jsonRes, requireAuth } from "../_lib/events.js";
import { handleOptions } from "../_lib/auth.js";

export default async function handler(req) {
  if (req.method === "OPTIONS") return handleOptions();
  try {
    if (req.method !== "GET") {
      return jsonRes(405, { error: "Method not allowed" });
    }

    const user = await requireAuth(req);
    if (!user) return jsonRes(401, { error: "Authentication required" });

    const events = await getEventsCollection();
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
      if (done(a) !== done(b)) return done(a) - done(b);
      if (a.dueDate && b.dueDate) return new Date(a.dueDate) - new Date(b.dueDate);
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    return jsonRes(200, list);
  } catch (err) {
    console.error(err);
    return jsonRes(500, { error: "Internal server error" });
  }
}
