import { Check, Pencil, Trash2 } from "lucide-react";
import { statusMeta, taskStatus } from "../utils/helpers";

export default function TaskItem({ task, onToggle, onEdit, onDelete, memberName }) {
  const status = statusMeta(taskStatus(task));
  return (
    <li
      className={`group flex items-start gap-3 rounded-xl p-5 transition-all duration-200 ${
        status.key === "completed" ? "opacity-60" : ""
      }`}
      style={{
        background: task.completed
          ? "linear-gradient(180deg, #cfe9d8 0%, #bfe6d0 16.667%, #c9e6e0 33.333%, #e3efd6 50%, #f3e8df 66.667%, #f3e2e0 83.333%, #efdde8 100%)"
          : "linear-gradient(180deg, #a9caff 0%, #b8cbff 16.667%, #d3cbff 33.333%, #f0c8f9 50%, #ffc5f1 66.667%, #ffc0ec 83.333%, #ffbaec 100%)",
        border: task.completed
          ? "1px solid rgba(16,185,129,0.45)"
          : "1px solid rgba(29,23,51,0.12)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        aria-pressed={task.completed}
        aria-label={task.completed ? "Mark task as pending" : "Mark task as completed"}
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
                borderColor: "rgba(29,23,51,0.3)",
                background: "transparent",
              }
        }
        onMouseEnter={(e) => {
          if (status.key !== "completed") {
            e.currentTarget.style.borderColor = "rgba(16,185,129,0.7)";
            e.currentTarget.style.boxShadow = "0 0 8px rgba(16,185,129,0.3)";
          }
        }}
        onMouseLeave={(e) => {
          if (status.key !== "completed") {
            e.currentTarget.style.borderColor = "rgba(29,23,51,0.3)";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
      >
        {status.key === "completed" && <Check size={12} strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={`text-lg font-bold break-words ${status.key === "completed" ? "line-through" : ""}`}
            style={{ color: status.key === "completed" ? "rgba(29,23,51,0.5)" : "#0f172a" }}
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
        </div>
        {task.description && (
          <p className="mt-1 text-base font-bold break-words leading-relaxed" style={{ color: "#0D47A1" }}>
            {task.description}
          </p>
        )}
        {(memberName || task.dueDate) && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {memberName && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  color: "#7c3aed",
                  background: "rgba(168,85,247,0.12)",
                  border: "1px solid rgba(168,85,247,0.25)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                👤 {memberName}
              </span>
            )}
            {task.dueDate && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{
                  color: "#0f766e",
                  background: "rgba(20,184,166,0.1)",
                  border: "1px solid rgba(20,184,166,0.22)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                📅 {new Date(`${task.dueDate}T00:00:00`).toLocaleDateString([], { month: "short", day: "numeric" })}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
        <button
          onClick={onEdit}
          aria-label="Edit task"
          className="rounded-full p-1.5 transition-all duration-150"
          style={{ color: "#4b4660" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(29,23,51,0.08)";
            e.currentTarget.style.color = "#1d1733";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#4b4660";
          }}
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          aria-label="Delete task"
          className="rounded-full p-1.5 transition-all duration-150"
          style={{ color: "#4b4660" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(225,29,106,0.16)";
            e.currentTarget.style.color = "#9d174d";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#4b4660";
          }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </li>
  );
}
