import { getDb, requireAdmin, jsonRes, readBody } from "./auth.js";

const TASK_STATUS = ["pending", "in_progress", "completed"];
const EVENT_TYPES = ["event", "bootcamp"];

function genId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function addTaskDefaults(body) {
  const status = TASK_STATUS.includes(body.status) ? body.status : "pending";
  return {
    id: body.id || genId("task"),
    title: String(body.title ?? "").trim(),
    description: String(body.description ?? ""),
    category: body.category ?? "before",
    dueDate: body.dueDate ?? "",
    priority: body.priority ?? "medium",
    status,
    completed: status === "completed" || Boolean(body.completed),
    assigneeId: body.assigneeId || null,
    createdAt: body.createdAt ?? Date.now(),
  };
}

function normalizeTaskPatch(patch, existingTask = {}) {
  const next = {};
  if (patch.title !== undefined) next.title = String(patch.title).trim();
  if (patch.description !== undefined) next.description = String(patch.description);
  if (patch.category !== undefined) next.category = patch.category;
  if (patch.dueDate !== undefined) next.dueDate = patch.dueDate ?? "";
  if (patch.priority !== undefined) next.priority = patch.priority;
  if (patch.assigneeId !== undefined) next.assigneeId = patch.assigneeId || null;

  const currentStatus = existingTask.status ?? (existingTask.completed ? "completed" : "pending");
  if (patch.status !== undefined && TASK_STATUS.includes(patch.status)) {
    next.status = patch.status;
    next.completed = patch.status === "completed";
  } else if (patch.completed !== undefined) {
    next.completed = Boolean(patch.completed);
    if (next.completed) next.status = "completed";
    else next.status = currentStatus === "completed" ? "pending" : currentStatus;
  }
  return next;
}

export async function getEventsCollection() {
  const db = await getDb();
  return db.collection("events");
}

export { genId, addTaskDefaults, normalizeTaskPatch, TASK_STATUS, EVENT_TYPES };
