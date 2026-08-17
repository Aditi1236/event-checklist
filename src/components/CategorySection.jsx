import { ClipboardList } from "lucide-react";
import TaskItem from "./TaskItem";

const ACCENT_STYLES = {
  slate: {
    rail: "rgba(148,163,184,0.6)",
    dot: "#94a3b8",
    glow: "rgba(148,163,184,0.3)",
    label: "rgba(148,163,184,0.12)",
    labelBorder: "rgba(148,163,184,0.22)",
    labelText: "#94a3b8",
  },
  amber: {
    rail: "rgba(245,158,11,0.6)",
    dot: "#f59e0b",
    glow: "rgba(245,158,11,0.3)",
    label: "rgba(245,158,11,0.1)",
    labelBorder: "rgba(245,158,11,0.22)",
    labelText: "#fbbf24",
  },
  plum: {
    rail: "rgba(168,85,247,0.6)",
    dot: "#a855f7",
    glow: "rgba(168,85,247,0.3)",
    label: "rgba(168,85,247,0.1)",
    labelBorder: "rgba(168,85,247,0.22)",
    labelText: "#c084fc",
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
  const muted = isEmpty ? "#cbd5e1" : "#94a3b8";
  const pillText = isEmpty ? "#e2e8f0" : accent.labelText;

  return (
    <section
      className="relative p-6 rounded-2xl"
      style={{
        background: tasks.length === 0 ? "#000000" : "transparent",
        border: tasks.length === 0 ? "1px solid rgba(255,255,255,0.12)" : "none",
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
              background: isEmpty ? "rgba(255,255,255,0.12)" : accent.label,
              border: `1px solid ${isEmpty ? "rgba(255,255,255,0.25)" : accent.labelBorder}`,
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
          className="flex items-center gap-2 rounded-xl border border-dashed px-4 py-5 text-lg font-bold"
          style={{
            borderColor: "rgba(255,255,255,0.18)",
            color: "#e2e8f0",
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
