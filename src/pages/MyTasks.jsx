import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  CalendarDays,
  Flag,
  ExternalLink,
  TrendingUp,
} from "lucide-react";
import { useEvents } from "../context/EventsContext";
import { useAuth } from "../context/AuthContext";
import {
  statusMeta,
  taskStatus,
  priorityMeta,
  categoryMeta,
  formatDate,
  formatDateShort,
  daysUntil,
  TASK_STATUSES,
} from "../utils/helpers";

const STATUS_TABS = [
  { key: "all", label: "All Tasks" },
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In Progress" },
  { key: "completed", label: "Completed" },
];

export default function MyTasks() {
  const { user } = useAuth();
  const { events, toggleTask, updateTask, loaded } = useEvents();
  const [tab, setTab] = useState("all");

  const myTasks = useMemo(() => {
    if (!user) return [];
    return events.flatMap((evt) =>
      (evt.tasks ?? []).map((t) => ({
        ...t,
        eventId: evt.id,
        eventName: evt.name,
        eventType: evt.type,
        eventDate: evt.date,
        eventLocation: evt.location,
      }))
    ).filter((t) => t.assigneeId === user.id);
  }, [events, user]);

  const filtered = useMemo(() => {
    if (tab === "all") return myTasks;
    return myTasks.filter((t) => taskStatus(t) === tab);
  }, [myTasks, tab]);

  const sortedFiltered = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const order = { pending: 0, in_progress: 1, completed: 2 };
        const da = order[taskStatus(a)] ?? 9;
        const db = order[taskStatus(b)] ?? 9;
        if (da !== db) return da - db;
        return (b.createdAt || 0) - (a.createdAt || 0);
      }),
    [filtered]
  );

  const stats = useMemo(() => {
    const total = myTasks.length;
    const pending = myTasks.filter((t) => taskStatus(t) === "pending").length;
    const inProgress = myTasks.filter((t) => taskStatus(t) === "in_progress").length;
    const completed = myTasks.filter((t) => taskStatus(t) === "completed").length;
    const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, pending, inProgress, completed, pct };
  }, [myTasks]);

  if (!loaded) {
    return (
      <div className="relative flex min-h-[60vh] items-center justify-center">
        <div className="ambient-bg">
          <div className="orb orb-rose" />
          <div className="orb orb-purple" />
        </div>
        <div
          className="relative z-10 h-10 w-10 animate-spin rounded-full"
          style={{
            border: "3px solid rgba(255,255,255,0.1)",
            borderTopColor: "#e11d6a",
            boxShadow: "0 0 20px rgba(225,29,106,0.25)",
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="ambient-bg">
        <div className="orb orb-rose" />
        <div className="orb orb-purple" />
        <div className="orb orb-emerald" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-10 sm:px-6">
                        {/* Header */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span
              className="inline-flex items-center gap-1.5 mb-3 text-[11px] uppercase tracking-widest font-semibold rounded-full px-3 py-1"
              style={{
                color: "#34d399",
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.2)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <CheckSquare size={13} /> My Tasks
            </span>
            <h1
              className="text-3xl font-extrabold text-white sm:text-4xl"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Welcome, {user?.name?.split(" ")[0] || "there"}
            </h1>
            <p className="mt-2 text-sm font-medium" style={{ color: "#94a3b8" }}>
              {user?.position ? `${user.position} · ` : ""}
              {user?.email}
            </p>
          </div>
          <Link to="/admin" className="btn-secondary text-sm !px-4 !py-2">
            <ExternalLink size={15} />
            Back to Events
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Total" value={stats.total} icon={<CheckSquare size={20} />} color="#94a3b8" />
          <StatCard label="Pending" value={stats.pending} icon={<Clock size={20} />} color="#fbbf24" />
          <StatCard label="In Progress" value={stats.inProgress} icon={<TrendingUp size={20} />} color="#a855f7" />
          <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 size={20} />} color="#34d399" progress={stats.pct} />
        </div>

{/* Status tabs */}
         <div className="mb-6 flex flex-wrap gap-1 rounded-full p-1 border" style={{
           borderColor: "rgba(255,255,255,0.12)",
           background: "#0247FE",
         }}>
          {STATUS_TABS.map((t) => {
            const isActive = tab === t.key;
            const count = t.key === "all" ? stats.total : myTasks.filter((x) => taskStatus(x) === t.key).length;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200"
                style={
                  isActive
                    ? {
                        color: "#ffffff",
                        background: "rgba(225,29,106,0.2)",
                        border: "1px solid rgba(225,29,106,0.4)",
                      }
                    : {
                        color: "#94a3b8",
                        background: "transparent",
                        border: "1px solid transparent",
                      }
                }
              >
                {t.label} <span style={{ opacity: 0.6 }}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Task list */}
{sortedFiltered.length === 0 ? (
           <div
             className="rounded-2xl border border-dashed px-8 py-16 text-center"
             style={{
               borderColor: "rgba(255,255,255,0.15)",
               background: "#0247FE",
             }}
           >
             <CheckSquare size={48} style={{ color: "#4b5563", margin: "0 auto 4px" }} />
             <h3 className="text-xl font-bold text-white mb-2">Nothing here yet</h3>
             <p style={{ color: "#64748b" }}>
               {tab === "all"
                 ? "No tasks have been assigned to you yet."
                 : `You have no ${tab.replace("_", " ")} tasks.`}
             </p>
           </div>
         ) : (
          <div className="space-y-3">
            {sortedFiltered.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() => toggleTask(task.eventId, task.id)}
                onStatus={(next) => updateTask(task.eventId, task.id, { status: next })}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    );
}

/* ── StatCard ───────────────────────────────────────── */
function StatCard({ label, value, icon, color, progress }) {
   return (
     <div
       className="rounded-2xl p-4 relative overflow-hidden"
       style={{
         background: "#0247FE",
         border: "1px solid rgba(255,255,255,0.08)",
         backdropFilter: "blur(16px)",
       }}
     >
      <div className="flex items-center gap-3 mb-2">
        <span style={{ color, flexShrink: 0 }}>{icon}</span>
        <span
          className="text-xs uppercase tracking-wider font-semibold"
          style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}
        >
          {label}
        </span>
      </div>
      <p
        className="text-2xl font-extrabold"
        style={{ color: "#f1f5f9", fontFamily: "'Sora', sans-serif" }}
      >
        {value}
      </p>
      {progress !== undefined && (
        <div className="mt-2 h-1 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #34d399, #10b981)",
            }}
          />
        </div>
      )}
    </div>
  );
}

/* ── TaskRow ────────────────────────────────────────── */
function TaskRow({ task, onToggle, onStatus }) {
  const status = statusMeta(taskStatus(task));
  const prio = priorityMeta(task.priority);
  const cat = categoryMeta(task.category);
  const remaining = daysUntil(task.dueDate);
  const dayTag =
    remaining === null
      ? null
      : remaining === 0
        ? { label: "Today", color: "#fbbf24" }
        : remaining > 0
          ? { label: `In ${remaining}d`, color: "#34d399" }
          : { label: "Past", color: "#64748b" };

return (
     <div
       className="group flex items-start gap-4 rounded-xl p-4 transition-all duration-200"
       style={{
         background: "#0247FE",
         border: "1px solid rgba(255,255,255,0.08)",
         backdropFilter: "blur(8px)",
       }}
     >
      <button
        onClick={onToggle}
        aria-pressed={task.completed}
        aria-label={task.completed ? "Mark as pending" : "Mark as completed"}
        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200"
        style={
          task.completed
            ? {
                borderColor: "#10b981",
                background: "linear-gradient(135deg, #10b981, #34d399)",
                boxShadow: "0 0 12px rgba(16,185,129,0.5)",
                color: "white",
              }
            : {
                borderColor: "rgba(255,255,255,0.2)",
                background: "transparent",
              }
        }
      >
        {task.completed && <CheckCircle2 size={12} strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={`text-lg font-bold break-words ${task.completed ? "line-through opacity-60" : ""}`}
            style={{ color: task.completed ? "rgba(241,245,249,0.45)" : "#f1f5f9" }}
          >
            {task.title}
          </p>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{
              color: status.color,
              background: status.bg,
              border: `1px solid ${status.border}`,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {status.label}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{
              color: "#fbbf24",
              background: "rgba(245,158,11,0.14)",
              border: "1px solid rgba(245,158,11,0.3)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {prio.dot} {prio.label}
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
            style={{
              color: cat.label,
              background: "rgba(100,116,139,0.12)",
              border: "1px solid rgba(100,116,139,0.25)",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {cat.label}
          </span>
        </div>

        {task.description && (
          <p className="mt-1 text-sm break-words" style={{ color: "#94a3b8" }}>
            {task.description}
          </p>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
          <Link
            to={`/event/${task.eventId}`}
            className="inline-flex items-center gap-1 font-semibold transition-colors"
            style={{ color: "#a855f7" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#c084fc")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#a855f7")}
          >
            <CalendarDays size={12} />
            {task.eventName} · {formatDateShort(task.eventDate)}
          </Link>
          {dayTag && (
            <span
              className="inline-flex items-center gap-1 font-semibold"
              style={{ color: dayTag.color, fontFamily: "'JetBrains Mono', monospace" }}
            >
              <Flag size={10} />
              {dayTag.label}
            </span>
          )}
          {task.dueDate && (
            <span className="inline-flex items-center gap-1" style={{ color: "#64748b" }}>
              <CalendarDays size={12} />
              Due {formatDateShort(task.dueDate)}
            </span>
          )}
        </div>

        {/* Status update — members can move their own tasks forward */}
        <div className="mt-3 flex items-center gap-2">
          <span
            className="text-[10px] uppercase tracking-widest font-semibold"
            style={{ color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}
          >
            Status
          </span>
          <select
            value={taskStatus(task)}
            onChange={(e) => onStatus?.(e.target.value)}
            aria-label="Update task status"
            className="cursor-pointer rounded-lg px-2 py-1 text-xs font-bold outline-none transition-all duration-200"
            style={{
              color: status.color,
              background: status.bg,
              border: `1px solid ${status.border}`,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {TASK_STATUSES.map((s) => (
              <option key={s.key} value={s.key} style={{ background: "#0f1120", color: s.color }}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}