import { CheckCircle2, Circle, Clock } from "lucide-react";

export default function EventTimeline({ tasks, onToggle }) {
  const timelineTasks = tasks
    .filter((t) => t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

  if (timelineTasks.length === 0) {
    return (
      <div
        className="rounded-2xl border border-dashed px-6 py-10 text-center"
        style={{ borderColor: "#262938", background: "#14161f" }}
      >
        <Clock size={20} className="mx-auto mb-2" style={{ color: "#475569" }} />
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
        background: "#14161f",
        border: "1px solid #262938",
        backdropFilter: "blur(16px)",
      }}
    >
      <div className="px-8 py-6 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <h3
          className="text-xl font-bold"
          style={{ color: "#f1f5f9", fontFamily: "'Sora', sans-serif" }}
        >
          Event Timeline
        </h3>
      </div>

      <div className="px-8 py-6">
        <div
          className="relative border-l-2 ml-3 space-y-8"
          style={{ borderColor: "rgba(255,255,255,0.1)" }}
        >
          {timelineTasks.map((task) => {
            const isPastDue = new Date(task.dueDate) < new Date() && !task.completed;
            return (
              <div key={task.id} className="relative pl-6">
                {/* Timeline dot */}
                <button
                  className="absolute -left-[11px] top-0.5 transition-transform hover:scale-110"
                  style={{ background: "#0a0c14" }}
                  onClick={() => onToggle && onToggle(task.id)}
                >
                  {task.completed ? (
                    <CheckCircle2 size={20} style={{ color: "#10b981", filter: "drop-shadow(0 0 4px rgba(16,185,129,0.5))" }} />
                  ) : (
                    <Circle size={20} style={{ color: isPastDue ? "#e11d6a" : "rgba(255,255,255,0.3)" }} />
                  )}
                </button>

                {/* Task content */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                  <div>
                    <h4
                      className="text-xl font-bold"
                      style={{
                        color: task.completed ? "rgba(241,245,249,0.45)" : "#f1f5f9",
                        textDecoration: task.completed ? "line-through" : "none",
                      }}
                    >
                      {task.title}
                    </h4>
                    {task.description && (
                      <p
                        className="mt-1 text-base font-semibold leading-relaxed"
                        style={{ color: task.completed ? "rgba(148,163,184,0.45)" : "#94a3b8" }}
                      >
                        {task.description}
                      </p>
                    )}
                  </div>
                  <div
                    className="shrink-0 text-base font-semibold rounded-full px-3 py-1"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: isPastDue && !task.completed ? "#fda4af" : "#94a3b8",
                      background: isPastDue && !task.completed ? "rgba(225,29,106,0.1)" : "rgba(255,255,255,0.05)",
                      border: `1px solid ${isPastDue && !task.completed ? "rgba(225,29,106,0.2)" : "rgba(255,255,255,0.08)"}`,
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
