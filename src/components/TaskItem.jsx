import { Check, Pencil, Trash2 } from "lucide-react";

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {  return (
    <li
      className={`group flex items-start gap-3 rounded-xl p-5 transition-all duration-200 ${
        task.completed ? "opacity-60" : ""
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
          if (!task.completed) {
            e.currentTarget.style.borderColor = "rgba(16,185,129,0.7)";
            e.currentTarget.style.boxShadow = "0 0 8px rgba(16,185,129,0.3)";
          }
        }}
        onMouseLeave={(e) => {
          if (!task.completed) {
            e.currentTarget.style.borderColor = "rgba(29,23,51,0.3)";
            e.currentTarget.style.boxShadow = "none";
          }
        }}
      >
        {task.completed && <Check size={12} strokeWidth={3} />}
      </button>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p
            className={`text-lg font-bold break-words ${task.completed ? "line-through" : ""}`}
            style={{ color: task.completed ? "rgba(29,23,51,0.5)" : "#0f172a" }}
          >
            {task.title}
          </p>
        </div>
        {task.description && (
          <p className="mt-1 text-base font-semibold break-words leading-relaxed" style={{ color: "rgba(29,23,51,0.6)" }}>
            {task.description}
          </p>
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
