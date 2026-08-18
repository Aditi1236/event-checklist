import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import confetti from "canvas-confetti";
import { useEvents } from "../context/EventsContext";
import ProgressStamp from "../components/ProgressStamp";
import ProgressBar from "../components/ProgressBar";
import CategorySection from "../components/CategorySection";
import EventForm from "../components/EventForm";
import TaskForm from "../components/TaskForm";
import ConfirmDialog from "../components/ConfirmDialog";
import EventTimeline from "../components/EventTimeline";
import {
  CATEGORIES,
  formatDate,
  progressOf,
} from "../utils/helpers";

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const {
    getEvent,
    updateEvent,
    deleteEvent,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
  } = useEvents();

  const event = getEvent(eventId);

  const [showEditEvent, setShowEditEvent] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(false);

  const grouped = useMemo(() => {
    if (!event) return {};
    return CATEGORIES.reduce((acc, c) => {
      acc[c.key] = event.tasks.filter((t) => t.category === c.key);
      return acc;
    }, {});
  }, [event]);

  const handleToggleTask = (taskId) => {
    toggleTask(event.id, taskId);
    const task = event.tasks.find((t) => t.id === taskId);
    if (task && !task.completed) {
      const { done, total } = progressOf(event);
      if (done + 1 === total && total > 0) {
        confetti({
          particleCount: 160,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#e11d6a", "#a855f7", "#10b981", "#f1f5f9"],
        });
      }
    }
  };

  if (!event) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1
          className="text-2xl font-bold text-white mb-3"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          Event not found
        </h1>
        <p className="text-sm text-ink-soft mb-8">
          It may have been deleted. Head back to the dashboard to see your
          other events.
        </p>
        <Link to="/" className="btn-primary inline-flex">
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>
      </div>
    );
  }

  const { done, total, pct } = progressOf(event);

  return (
    <div className="relative">
      {/* Ambient orbs (subtle, smaller than dashboard) */}
      <div className="ambient-bg" style={{ opacity: 0.6 }}>
        <div className="orb orb-rose" style={{ width: 400, height: 400, opacity: 0.12 }} />
        <div className="orb orb-purple" style={{ width: 300, height: 300, opacity: 0.1 }} />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 pb-24 pt-8 sm:px-6">
        {/* Back link */}
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
          style={{ color: "#64748b" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f1f5f9")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
        >
          <ArrowLeft size={15} />
          All events
        </Link>

        {/* ── Event hero card ─────────────────────── */}
        <div
          className="rounded-2xl overflow-hidden mb-8 animate-fadeIn"
          style={{
            background: "#30AFFF",
            border: "1px solid rgba(255,255,255,0.2)",
            backdropFilter: "blur(24px)",
            minHeight: 300,
            boxShadow: "0 4px 40px -8px rgba(48,175,255,0.4), 0 1px 3px rgba(0,0,0,0.2)",
          }}
        >
          {/* Gradient top accent */}
          <div
            className="h-px"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(225,29,106,0.7), rgba(168,85,247,0.5), transparent)",
            }}
          />

          <div className="p-8 sm:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                {/* Event name */}
                <h1
                  className="text-5xl font-extrabold sm:text-6xl leading-tight mb-4"
                  style={{ fontFamily: "'Sora', sans-serif", color: "#ffffff" }}
                >
                  {event.name}
                </h1>

                {/* Meta badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span
                    className="inline-flex items-center gap-1.5 text-base font-bold px-4 py-2 rounded-full"
                    style={{
                      background: "rgba(255,255,255,0.22)",
                      border: "1px solid rgba(255,255,255,0.4)",
                      color: "#ffffff",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    <CalendarDays size={14} />
                    {formatDate(event.date)}
                  </span>
                  {event.location && (
                    <span
                      className="inline-flex items-center gap-1.5 text-base font-bold px-4 py-2 rounded-full"
                      style={{
                        background: "rgba(255,255,255,0.22)",
                        border: "1px solid rgba(255,255,255,0.4)",
                        color: "#ffffff",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      <MapPin size={11} />
                      {event.location}
                    </span>
                  )}
                </div>

                {event.description && (
                  <p className="text-sm max-w-xl leading-relaxed" style={{ color: "#e2e8f0" }}>
                    {event.description}
                  </p>
                )}
              </div>

              {/* Progress stamp + actions */}
              <div className="flex shrink-0 items-center gap-4 self-start">
                <ProgressStamp pct={pct} size="xl" />
                <div className="flex flex-col gap-2">
                <button
                  className="!px-4 !py-2 text-sm font-semibold rounded-full transition-all duration-200"
                  onClick={() => setShowEditEvent(true)}
                  style={{
                    color: "#ffffff",
                    background: "rgba(255,255,255,0.18)",
                    border: "1px solid rgba(255,255,255,0.3)",
                  }}
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  className="!px-4 !py-2 text-sm font-semibold rounded-full transition-all duration-200"
                  onClick={() => setDeletingEvent(true)}
                  style={{
                    color: "#ffd6e7",
                    background: "rgba(225,29,106,0.3)",
                    border: "1px solid rgba(225,29,106,0.5)",
                  }}
                >
                  <Trash2 size={12} />
                  Delete
                </button>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <ProgressBar done={done} total={total} className="mt-6" light size="lg" />
          </div>
        </div>

        {/* ── Timeline ───────────────────────────── */}
        <div className="mb-8">
          <EventTimeline tasks={event.tasks} onToggle={handleToggleTask} />
        </div>

        {/* ── Checklist header ───────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2
              className="text-xl font-bold text-white"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Checklist
            </h2>
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.22)",
                color: "#34d399",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {done}/{total} done
            </span>
          </div>
          <button className="btn-accent" onClick={() => setShowAddTask(true)}>
            <Plus size={15} />
            Add task
          </button>
        </div>

        {/* ── Category sections ──────────────────── */}
        <div className="space-y-8">
          {CATEGORIES.map((category) => (
            <CategorySection
              key={category.key}
              category={category}
              tasks={grouped[category.key] ?? []}
              onToggle={handleToggleTask}
              onEdit={(task) => setEditingTask(task)}
              onDelete={(task) => setDeletingTask(task)}
            />
          ))}
        </div>

        {/* ── Modals ─────────────────────────────── */}
        {showEditEvent && (
          <EventForm
            initial={event}
            onClose={() => setShowEditEvent(false)}
            onSubmit={(data) => {
              updateEvent(event.id, data);
              setShowEditEvent(false);
            }}
          />
        )}
        {showAddTask && (
          <TaskForm
            onClose={() => setShowAddTask(false)}
            onSubmit={(data) => {
              addTask(event.id, data);
              setShowAddTask(false);
            }}
          />
        )}
        {editingTask && (
          <TaskForm
            initial={editingTask}
            onClose={() => setEditingTask(null)}
            onSubmit={(data) => {
              updateTask(event.id, editingTask.id, data);
              setEditingTask(null);
            }}
          />
        )}
        {deletingTask && (
          <ConfirmDialog
            title="Delete task?"
            message={`"${deletingTask.title}" will be removed from this checklist for good.`}
            onCancel={() => setDeletingTask(null)}
            onConfirm={() => {
              deleteTask(event.id, deletingTask.id);
              setDeletingTask(null);
            }}
          />
        )}
        {deletingEvent && (
          <ConfirmDialog
            title="Delete event?"
            message={`This removes "${event.name}" and all ${event.tasks.length} of its tasks. This can't be undone.`}
            onCancel={() => setDeletingEvent(false)}
            onConfirm={() => {
              deleteEvent(event.id);
              navigate("/");
            }}
          />
        )}
      </div>
    </div>
  );
}
