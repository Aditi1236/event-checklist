import { CheckCircle2, Circle, Clock } from "lucide-react";

export default function EventTimeline({ tasks, onToggle }) {
  const timelineTasks = tasks
    .filter((t) => t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  if (timelineTasks.length === 0) {
    return (
      <div
        className="rounded-2xl border border-dashed px-6 py-10 text-center"
        style={{ borderColor: "rgba(15,23,42,0.15)", background: "#ffffff" }}
      >
        <Clock size={20} className="mx-auto mb-2" style={{ color: "#64748b" }} />
        <p className="text-sm" style={{ color: "#64748b" }}>
          No tasks with a due date yet. Add a due date to a task to see it here.
        </p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,23,42,0.08)",
        boxShadow: "0 10px 30px -8px rgba(15,23,42,0.08)",
      }}
    >
      <div className="px-8 py-6 border-b" style={{ borderColor: "rgba(15,23,42,0.06)" }}>
        <h3
          className="text-xl font-bold"
          style={{ color: "#0f172a", fontFamily: "'Sora', sans-serif" }}
        >
          Event Timeline
        </h3>
      </div>

      <div className="px-8 py-6">
        <div
          className="relative border-l-2 ml-3 space-y-8"
          style={{ borderColor: "rgba(15,23,42,0.15)" }}
        >
          {timelineTasks.map((task) => {
            const isPastDue = new Date(task.dueDate) < new Date() && !task.completed;
            return (
              <div key={task.id} className="relative pl-6">
                {/* Timeline dot */}
                <button
                  className="absolute -left-[11px] top-0.5 transition-transform hover:scale-110"
                  style={{ background: "#ffffff" }}
                  onClick={() => onToggle && onToggle(task.id)}
                >
                  {task.completed ? (
                    <CheckCircle2 size={20} style={{ color: "#059669" }} />
                  ) : (
                    <Circle size={20} style={{ color: isPastDue ? "#dc2626" : "#94a3b8" }} />
                  )}
                </button>

                {/* Task content */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <h4
                      className="text-xl font-bold"
                      style={{
                        color: task.completed ? "#94a3b8" : "#0f172a",
                        textDecoration: task.completed ? "line-through" : "none",
                      }}
                    >
                      {task.title}
                    </h4>
                    {task.description && (
                      <p
                        className="mt-1 text-base font-semibold leading-relaxed"
                        style={{ color: task.completed ? "#94a3b8" : "#64748b" }}
                      >
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div
                    className="shrink-0 text-base font-semibold rounded-full px-3 py-1"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: isPastDue && !task.completed ? "#b91c1c" : "#64748b",
                      background: isPastDue && !task.completed ? "rgba(220,38,38,0.06)" : "rgba(15,23,42,0.05)",
                      border: `1px solid ${isPastDue && !task.completed ? "rgba(220,38,38,0.15)" : "rgba(15,23,42,0.08)"}`,
                    }}
                  >
                    {new Date(task.dueDate).toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}