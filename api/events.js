import { listEvents, createEvent } from "./_lib/operations.js";

export default async function handler(req, res) {
  try {
    if (req.method === "GET") {
      const all = await listEvents();
      return res.status(200).json(all);
    }
    if (req.method === "POST") {
      const event = await createEvent(req.body || {});
      return res.status(201).json(event);
    }
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
