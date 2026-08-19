import { getEvent, updateTask, deleteTask } from "../../../_lib/operations.js";

export default async function handler(req, res) {
  const { id, taskId } = req.query;
  try {
    if (req.method === "PUT") {
      const event = await getEvent(id);
      if (!event) return res.status(404).json({ error: "Event not found" });
      const result = await updateTask(id, taskId, req.body || {});
      if (result?.error) return res.status(404).json({ error: "Task not found" });
      return res.status(200).json(result);
    }
    if (req.method === "DELETE") {
      await deleteTask(id, taskId);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
