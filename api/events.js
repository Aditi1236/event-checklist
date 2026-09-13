import { getEventsCollection, genId, EVENT_TYPES } from "./_lib/events.js";
import { jsonRes, requireAdmin, handleOptions } from "./_lib/auth.js";

export default async function handler(req) {
  if (req.method === "OPTIONS") return handleOptions();
  try {
    if (req.method === "GET") {
      const events = await getEventsCollection();
      const all = await events.find({}).sort({ createdAt: -1 }).toArray();
      return jsonRes(200, all);
    }
    if (req.method === "POST") {
      const admin = await requireAdmin(req);
      if (!admin) return jsonRes(403, { error: "Admin access required" });
      const body = await req.json();
      const type = EVENT_TYPES.includes(body.type) ? body.type : "event";
      const event = {
        id: body.id || genId("evt"),
        name: body.name ?? "",
        type,
        date: body.date ?? "",
        endDate: body.endDate ?? "",
        duration: String(body.duration || "").trim(),
        category: String(body.category || "").trim(),
        description: body.description ?? "",
        location: body.location ?? "",
        mode: body.mode ?? "",
        capacity: Number(body.capacity) || 0,
        techStack: String(body.techStack || "").trim(),
        budget: Number(body.budget) || 0,
        registrations: Number(body.registrations) || 0,
        teamMembers: body.teamMembers ?? "",
        speakers: String(body.speakers || "").trim(),
        collaborators: String(body.collaborators || "").trim(),
        learningOutcomes: String(body.learningOutcomes || "").trim(),
        studentBenefits: String(body.studentBenefits || "").trim(),
        targetAudience: String(body.targetAudience || "").trim(),
        prerequisites: String(body.prerequisites || "").trim(),
        registrationLink: String(body.registrationLink || "").trim(),
        highlights: String(body.highlights || "").trim(),
        tasks: Array.isArray(body.tasks) ? body.tasks : [],
        createdAt: body.createdAt ?? Date.now(),
      };
      const events = await getEventsCollection();
      await events.insertOne(event);
      return jsonRes(201, event);
    }
    return jsonRes(405, { error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return jsonRes(500, { error: "Internal server error" });
  }
}
