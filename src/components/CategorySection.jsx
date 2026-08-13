import { ClipboardList } from "lucide-react";
import TaskItem from "./TaskItem";

const RAIL_CLASSES = {
  slate: "before:bg-slate",
  amber: "before:bg-amber",
  plum: "before:bg-plum",
};

const DOT_CLASSES = {
  slate: "bg-slate",
  amber: "bg-amber",
  plum: "bg-plum",
};

export default function CategorySection({
  category,
  tasks,
  onToggle,
  onEdit,
  onDelete,
}) {
  const done = tasks.filter((t) => t.completed).length;

  return (
    <section
      className={`relative pl-4 before:absolute before:left-0 before:top-1 before:bottom-1 before:w-1 before:rounded-full ${RAIL_CLASSES[category.accent]}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${DOT_CLASSES[category.accent]}`} />
          <h3 className="font-display text-lg font-semibold text-ink">
            {category.label}
          </h3>
        </div>
        <span className="font-mono text-xs text-ink-soft">
          {done}/{tasks.length}
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-paper-line px-4 py-4 text-sm text-ink-soft">
          <ClipboardList size={16} />
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
