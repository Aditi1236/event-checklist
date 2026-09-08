import { ClipboardList } from "lucide-react";
import TaskItem from "./TaskItem";

const ACCENT_STYLES = {
  slate: {
    rail: "rgba(148,163,184,0.6)",
    dot: "#94a3b8",
    glow: "rgba(148,163,184,0.3)",
    label: "rgba(148,163,184,0.12)",
    labelBorder: "rgba(148,163,184,0.22)",
    labelText: "#64748b",
  },
  amber: {
    rail: "rgba(245,158,11,0.6)",
    dot: "#f59e0b",
    glow: "rgba(245,158,11,0.3)",
    label: "rgba(245,158,11,0.1)",
    labelBorder: "rgba(245,158,11,0.22)",
    labelText: "#b45309",
  },
  plum: {
    rail: "rgba(124,58,237,0.6)",
    dot: "#7c3aed",
    glow: "rgba(124,58,237,0.3)",
    label: "rgba(124,58,237,0.08)",
    labelBorder: "rgba(124,58,237,0.2)",
    labelText: "#6d28d9",
  },
};

export default function CategorySection({
  category,
  tasks,
  onToggle,
  onEdit,
  onDelete,
}) {
  const done = tasks.filter((t) => t.completed).length;
  const accent = ACCENT_STYLES[category.accent] || ACCENT_STYLES.slate;
  const isEmpty = tasks.length === 0;
  const muted = isEmpty ? "#94a3b8" : "#64748b";
  const pillText = isEmpty ? "#64748b" : accent.labelText;

  return (
    <section
      className="relative p-6 rounded-2xl"
      style={{
        background: tasks.length === 0 ? "rgba(15,23,42,0.03)" : "transparent",
        border: tasks.length === 0 ? "1px solid rgba(15,23,42,0.08)" : "none",
      }}
    >
      {/* Glowing left rail */}
      <div
        className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full"
        style={{
          background: `linear-gradient(to bottom, transparent, ${accent.rail}, transparent)`,
          boxShadow: `0 0 8px ${accent.glow}`,
        }}
      />

      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Glowing dot */}
          <span
            className="h-2 w-2 rounded-full flex-shrink-0"
            style={{
              background: accent.dot,
              boxShadow: `0 0 8px ${accent.glow}`,
            }}
          />
          <h3
            className="text-2xl font-extrabold text-ink"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {category.label}
          </h3>
          {/* Category pill */}
          <span
            className="text-lg font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full"
            style={{
              background: isEmpty ? "rgba(15,23,42,0.05)" : accent.label,
              border: `1px solid ${isEmpty ? "rgba(15,23,42,0.12)" : accent.labelBorder}`,
              color: pillText,
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {tasks.length}
          </span>
        </div>
        <span
          className="text-base font-bold"
          style={{
            color: done === tasks.length && tasks.length > 0 ? "#34d399" : muted,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {done}/{tasks.length}
        </span>
      </div>

      {/* Tasks */}
      {tasks.length === 0 ? (
          <div
            className="flex items-center gap-2 rounded-xl border px-4 py-5 text-lg font-bold"
            style={{
              borderColor: "rgba(15,23,42,0.12)",
              background: "transparent",
              color: "#64748b",
            }}
          >
          <ClipboardList size={18} />
          No tasks in this category yet.
        </div>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => onToggle(task.id)}
              onEdit={() => onEdit(task)}
              onDelete={() => onDelete(task)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
