import { useMemo, useState } from "react";
import { Plus, CalendarRange, LayoutGrid, Users, DollarSign, Ticket } from "lucide-react";
import { useEvents } from "../context/EventsContext";
import EventCard from "../components/EventCard";
import EventForm from "../components/EventForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { progressOf, formatDate } from "../utils/helpers";
import { Link } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import { AlertTriangle } from "lucide-react";
import TaskItem from "../components/TaskItem";

export default function Dashboard() {
  const { events, createEvent, updateEvent, deleteEvent, toggleTask } = useEvents();
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const stats = useMemo(() => {
    const totalEvents = events.length;
    let totalTasks = 0;
    let doneTasks = 0;
    let upcoming = 0;
    let urgent = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    events.forEach((e) => {
      const { total, done } = progressOf(e);
      totalTasks += total;
      doneTasks += done;
      if (e.date && new Date(`${e.date}T00:00:00`) >= today) upcoming += 1;
      urgent += e.tasks.filter((t) => t.priority === "high" && !t.completed).length;
    });
    return { totalEvents, totalTasks, doneTasks, upcoming, urgent };
  }, [events]);

  const urgentTasks = useMemo(() => {
    const items = [];
    events.forEach((e) => {
      e.tasks.forEach((t) => {
        if (t.priority === "high" && !t.completed) {
          items.push({ ...t, eventId: e.id, eventName: e.name });
        }
      });
    });
    return items;
  }, [events]);

  const sortedEvents = useMemo(
    () =>
      [...events]
        .filter((e) =>
          e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (e.location && e.location.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return new Date(a.date) - new Date(b.date);
        }),
    [events, searchQuery]
  );

  const upcomingEvent = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return [...events]
      .filter((e) => e.date && new Date(`${e.date}T00:00:00`) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  }, [events]);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-ink-soft mb-2">
            Dashboard
          </p>
          <h1 className="font-display text-3xl font-semibold text-ink sm:text-4xl">
            Every event, on one clipboard.
          </h1>
          <p className="mt-2 max-w-xl text-sm text-ink-soft">
            Plan the run of show, track who has done what, and never miss a
            before, during, or after task again.
          </p>
        </div>
        <button className="btn-accent self-start" onClick={() => setShowCreate(true)}>
          <Plus size={16} />
          New event
        </button>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Events" value={stats.totalEvents} icon={<LayoutGrid size={15} />} />
        <StatCard label="Upcoming" value={stats.upcoming} icon={<CalendarRange size={15} />} />
        <StatCard label="Tasks logged" value={stats.totalTasks} />
        <StatCard
          label="Tasks done"
          value={`${stats.doneTasks}/${stats.totalTasks || 0}`}
          accent
        />
      </div>

      {urgentTasks.length > 0 && (
        <div className="mt-10">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white">
              <AlertTriangle size={15} />
            </span>
            <h2 className="font-display text-xl font-semibold text-ink">
              Urgent tasks ({stats.urgent})
            </h2>
          </div>
          <ul className="card-surface divide-y divide-paper-line/60 px-2">
            {urgentTasks.map((t) => (
              <li key={t.id} className="px-3 py-3">
                <Link
                  to={`/event/${t.eventId}`}
                  className="mb-1 block font-mono text-[11px] uppercase tracking-[0.12em] text-ink-soft hover:text-slate transition-colors"
                >
                  {t.eventName}
                </Link>
                <TaskItem task={t} onToggle={() => toggleTask(t.eventId, t.id)} onEdit={() => {}} onDelete={() => {}} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {upcomingEvent && !searchQuery && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-semibold text-ink mb-4">
            Next Upcoming Event
          </h2>
          <div className="card-surface p-6 sm:p-8 flex flex-col md:flex-row gap-8 justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-display text-2xl font-bold text-white">
                  {upcomingEvent.name}
                </h3>
                <span className="bg-primary-light/20 text-primary-light px-2.5 py-1 rounded-full text-xs font-semibold">
                  {formatDate(upcomingEvent.date)}
                </span>
              </div>
              <p className="text-sm text-white/70 mb-6 max-w-lg">
                {upcomingEvent.description || "No description provided."}
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm font-medium text-white/80">
                  <span>Preparation Progress</span>
                  <span>{progressOf(upcomingEvent).pct}%</span>
                </div>
                <ProgressBar done={progressOf(upcomingEvent).done} total={progressOf(upcomingEvent).total} />
              </div>
              <Link to={`/event/${upcomingEvent.id}`} className="btn-primary">
                Manage Event
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4 md:w-72 shrink-0">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-wider mb-2">
                  <DollarSign size={14} /> Budget
                </div>
                <div className="text-xl font-semibold text-white">${upcomingEvent.budget || 0}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-wider mb-2">
                  <Ticket size={14} /> Registrations
                </div>
                <div className="text-xl font-semibold text-white">{upcomingEvent.registrations || 0}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 col-span-2">
                <div className="flex items-center gap-2 text-white/60 text-xs uppercase tracking-wider mb-2">
                  <Users size={14} /> Team
                </div>
                <div className="text-sm font-medium text-white">
                  {upcomingEvent.teamMembers ? upcomingEvent.teamMembers : "No team assigned"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-10">
        <div className="mb-6 flex justify-between items-center gap-4">
          <input
            type="text"
            placeholder="Search events by name or location..."
            className="field-input max-w-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {sortedEvents.length === 0 ? (
          searchQuery ? (
            <div className="text-center py-12 text-ink-soft">
              No events found matching "{searchQuery}"
            </div>
          ) : (
            <EmptyState onCreate={() => setShowCreate(true)} />
          )
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sortedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={() => setEditingEvent(event)}
                onDelete={() => setDeletingEvent(event)}
              />
            ))}
          </div>
        )}
      </div>

      {showCreate && (
        <EventForm
          onClose={() => setShowCreate(false)}
          onSubmit={(data) => {
            createEvent(data);
            setShowCreate(false);
          }}
        />
      )}

      {editingEvent && (
        <EventForm
          initial={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSubmit={(data) => {
            updateEvent(editingEvent.id, data);
            setEditingEvent(null);
          }}
        />
      )}

      {deletingEvent && (
        <ConfirmDialog
          title="Delete event?"
          message={`This removes "${deletingEvent.name}" and all ${deletingEvent.tasks.length} of its tasks. This can't be undone.`}
          onCancel={() => setDeletingEvent(null)}
          onConfirm={() => {
            deleteEvent(deletingEvent.id);
            setDeletingEvent(null);
          }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="card-surface px-4 py-3.5">
      <div className="flex items-center gap-1.5 text-white/80">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-[0.14em]">
          {label}
        </span>
      </div>
      <p
        className={`mt-1 font-display text-2xl font-semibold ${
          accent ? "text-emerald-dark" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div className="card-surface flex flex-col items-center gap-3 border-dashed px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
        <CalendarRange size={22} />
      </div>
      <h3 className="font-display text-lg font-semibold text-white">
        No events yet
      </h3>
      <p className="max-w-xs text-sm text-white/80">
        Create your first event to start organizing tasks and tracking progress.
      </p>
      <button className="btn-secondary mt-2 text-white border-white/30 hover:border-white hover:bg-white/10" onClick={onCreate}>
        <Plus size={16} />
        Create your first event
      </button>
    </div>
  );
}
