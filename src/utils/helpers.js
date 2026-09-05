export const STORAGE_KEY = "roster.events.v1";

export function genId(prefix = "id") {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function loadEvents() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to load events from storage", err);
    return [];
  }
}

export function saveEvents(events) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (err) {
    console.error("Failed to save events to storage", err);
  }
}

export const CATEGORIES = [
  { key: "before", label: "Before Event", accent: "slate" },
  { key: "during", label: "During Event", accent: "amber" },
  { key: "after", label: "After Event", accent: "plum" },
];

export const TASK_STATUSES = [
  { key: "pending", label: "Pending", color: "#94a3b8", bg: "rgba(148,163,184,0.14)", border: "rgba(148,163,184,0.3)" },
  { key: "in_progress", label: "In Progress", color: "#fbbf24", bg: "rgba(245,158,11,0.14)", border: "rgba(245,158,11,0.32)" },
  { key: "completed", label: "Completed", color: "#34d399", bg: "rgba(16,185,129,0.14)", border: "rgba(16,185,129,0.32)" },
];

export function statusMeta(key) {
  return TASK_STATUSES.find((s) => s.key === key) ?? TASK_STATUSES[0];
}

export function taskStatus(task = {}) {
  if (task.status) return task.status;
  return task.completed ? "completed" : "pending";
}

export const EVENT_TYPES = [
  { key: "event", label: "Event", color: "#e11d6a" },
  { key: "bootcamp", label: "Bootcamp", color: "#a855f7" },
];

export function eventTypeMeta(key) {
  return EVENT_TYPES.find((t) => t.key === key) ?? EVENT_TYPES[0];
}

export const PRIORITIES = [
  { key: "high", label: "High", dot: "🔴", badge: "bg-red-500 text-white" },
  { key: "medium", label: "Medium", dot: "🟡", badge: "bg-amber-500 text-primary" },
  { key: "low", label: "Low", dot: "🟢", badge: "bg-emerald-500 text-white" },
];

export function priorityMeta(key) {
  return PRIORITIES.find((p) => p.key === key) ?? PRIORITIES[1];
}

export const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export function categoryMeta(key) {
  return CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[0];
}

export function formatDate(dateStr) {
  if (!dateStr) return "No date set";
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return "TBD";
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((target - today) / 86400000);
  return diff;
}

export function progressOf(event) {
  const tasks = event?.tasks ?? [];
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return { done, total, pct };
}
