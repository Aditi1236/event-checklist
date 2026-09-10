import { getEventsCollection, jsonRes, requireAdmin } from "./_lib/events.js";
import { handleOptions } from "./_lib/auth.js";

export default async function handler(req) {
  if (req.method === "OPTIONS") return handleOptions();
  try {
    if (req.method !== "GET") {
      return jsonRes(405, { error: "Method not allowed" });
    }

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
  } catch (err) {
    console.error(err);
    return jsonRes(500, { error: "Internal server error" });
  }
}
