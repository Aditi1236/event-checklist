import { getEvent, updateEvent, deleteEvent } from "../../_lib/operations.js";

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === "GET") {
      const event = await getEvent(id);
      if (!event) return res.status(404).json({ error: "Event not found" });
      return res.status(200).json(event);
    }
    if (req.method === "PUT") {
      const updated = await updateEvent(id, req.body || {});
      return res.status(200).json(updated);
    }
    if (req.method === "DELETE") {
      await deleteEvent(id);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
