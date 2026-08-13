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
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2c2c2c', '#853953', '#612d53', '#f3f4f4']
        });
      }
    }
  };

  if (!event) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-semibold text-ink">
          Event not found
        </h1>
        <p className="mt-2 text-sm text-ink-soft">
          It may have been deleted. Head back to the dashboard to see your
          other events.
        </p>
        <Link to="/" className="btn-primary mt-6 inline-flex">
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>
      </div>
    );
  }

  const { done, total, pct } = progressOf(event);

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-8 sm:px-6">
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-slate transition-colors"
      >
        <ArrowLeft size={15} />
        All events
      </Link>

      <div className="card-surface p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-semibold text-white sm:text-3xl">
              {event.name}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-white/80">
              <span className="flex items-center gap-1.5">
                <CalendarDays size={14} />
                {formatDate(event.date)}
              </span>
              {event.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {event.location}
                </span>
              )}
            </div>
            {event.description && (
              <p className="mt-3 max-w-xl text-sm text-white/80">
                {event.description}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-4 self-start">
            <ProgressStamp pct={pct} size="lg" />
            <div className="flex flex-col gap-2">
              <button
                className="btn-secondary !px-3 !py-1.5 text-xs"
                onClick={() => setShowEditEvent(true)}
              >
                <Pencil size={13} />
                Edit
              </button>
              <button
                className="btn-danger !px-3 !py-1.5 text-xs"
                onClick={() => setDeletingEvent(true)}
              >
                <Trash2 size={13} />
                Delete
              </button>
            </div>
          </div>
        </div>

        <ProgressBar done={done} total={total} className="mt-6" />
      </div>

      <div className="mt-8 mb-8">
        <EventTimeline tasks={event.tasks} onToggle={handleToggleTask} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold text-ink">
          Checklist
        </h2>
        <button className="btn-accent" onClick={() => setShowAddTask(true)}>
          <Plus size={16} />
          Add task
        </button>
      </div>

      <div className="mt-6 space-y-8">
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
  );
}
