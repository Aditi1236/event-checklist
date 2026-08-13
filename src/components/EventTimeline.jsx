import { CheckCircle2, Circle } from "lucide-react";
import { formatDateShort } from "../utils/helpers";

export default function EventTimeline({ tasks, onToggle }) {
  // Filter tasks that have a due date, and sort them chronologically
  const timelineTasks = tasks
    .filter((t) => t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  if (timelineTasks.length === 0) {
    return (
      <div className="card-surface px-6 py-10 text-center border-dashed">
        <p className="text-sm text-white/80">
          No tasks with a due date. Add a due date to tasks to see them on the timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="card-surface p-6 sm:p-8">
      <h3 className="font-display text-lg font-semibold text-white mb-6">
        Event Timeline
      </h3>
      <div className="relative border-l-2 border-white/10 ml-3 space-y-6">
        {timelineTasks.map((task, index) => {
          const isPastDue = new Date(task.dueDate) < new Date() && !task.completed;
          return (
            <div key={task.id} className="relative pl-6">
              {/* Timeline Dot */}
              <button
                className="absolute -left-[11px] top-1 bg-paper-soft text-white transition-transform hover:scale-110"
                onClick={() => onToggle && onToggle(task.id)}
              >
                {task.completed ? (
                  <CheckCircle2 size={20} className="text-emerald-400" />
                ) : (
                  <Circle size={20} className={isPastDue ? "text-rust" : "text-white/40"} />
                )}
              </button>
              
              {/* Task Content */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div>
                  <h4 className={`text-sm font-medium ${task.completed ? "text-white/50 line-through" : "text-white"}`}>
                    {task.title}
                  </h4>
                  {task.description && (
                    <p className={`mt-1 text-xs ${task.completed ? "text-white/40" : "text-white/70"}`}>
                      {task.description}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-xs text-white/60 font-mono">
                  {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
