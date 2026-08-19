import { getEventsCollection } from "./db.js";

export function genId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function listEvents() {
  const events = await getEventsCollection();
  return events.find({}).sort({ createdAt: -1 }).toArray();
}

export async function createEvent(body = {}) {
  const events = await getEventsCollection();
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
  await events.insertOne(event);
  return event;
}

export async function getEvent(eventId) {
  const events = await getEventsCollection();
  return events.findOne({ id: eventId });
}

export async function updateEvent(eventId, patch = {}) {
  const events = await getEventsCollection();
  await events.updateOne({ id: eventId }, { $set: patch });
  return events.findOne({ id: eventId });
}

export async function deleteEvent(eventId) {
  const events = await getEventsCollection();
  await events.deleteOne({ id: eventId });
  return { ok: true };
}

export async function addTask(eventId, body = {}) {
  const events = await getEventsCollection();
  const event = await events.findOne({ id: eventId });
  if (!event) return null;
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
  await events.updateOne({ id: eventId }, { $push: { tasks: task } });
  return task;
}

export async function updateTask(eventId, taskId, patch = {}) {
  const events = await getEventsCollection();
  const event = await events.findOne({ id: eventId });
  if (!event) return { error: "event_not_found" };
  const task = event.tasks?.find((t) => t.id === taskId);
  if (!task) return { error: "task_not_found" };
  const updated = { ...task, ...patch };
  await events.updateOne(
    { id: eventId, "tasks.id": taskId },
    { $set: { "tasks.$": updated } }
  );
  return updated;
}

export async function deleteTask(eventId, taskId) {
  const events = await getEventsCollection();
  await events.updateOne({ id: eventId }, { $pull: { tasks: { id: taskId } } });
  return { ok: true };
}
