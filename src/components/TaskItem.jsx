import { Check, Pencil, Trash2 } from "lucide-react";
import { priorityMeta } from "../utils/helpers";

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const priority = priorityMeta(task.priority);
  return (
    <li
      className={`group flex items-start gap-3 rounded-xl border border-paper-line bg-paper-soft px-4 py-3.5 transition-all duration-200 hover:shadow-card ${
        task.completed ? "opacity-70" : ""
      }`}
    >
      <button
        onClick={onToggle}
        aria-pressed={task.completed}
        aria-label={task.completed ? "Mark task as pending" : "Mark task as completed"}
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
          task.completed
            ? "border-emerald bg-emerald text-paper-soft"
            : "border-ink-soft/40 hover:border-slate"
        }`}
      >
        {task.completed && <Check size={13} strokeWidth={3} />}
      </button>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p
            className={`text-sm font-medium text-ink break-words ${
              task.completed ? "line-through decoration-ink-soft/50" : ""
            }`}
          >
            {task.title}
          </p>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${priority.badge}`}
          >
            {priority.dot} {priority.label}
          </span>
        </div>
        {task.description && (
          <p className="mt-0.5 text-sm text-ink-soft break-words">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
        <button
          onClick={onEdit}
          aria-label="Edit task"
          className="rounded-full p-1.5 text-ink-soft hover:bg-slate/10 hover:text-slate transition-colors"
        >
          <Pencil size={15} />
        </button>
        <button
          onClick={onDelete}
          aria-label="Delete task"
            className="rounded-full p-1.5 text-ink-soft hover:bg-primary-light/10 hover:text-primary-light transition-colors"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </li>
  );
}
