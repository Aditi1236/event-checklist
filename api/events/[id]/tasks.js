import { getEvent, addTask } from "../../_lib/operations.js";

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    if (req.method === "POST") {
      const event = await getEvent(id);
      if (!event) return res.status(404).json({ error: "Event not found" });
      const task = await addTask(id, req.body || {});
      return res.status(201).json(task);
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
