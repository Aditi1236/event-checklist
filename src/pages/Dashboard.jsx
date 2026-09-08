import { useMemo, useState } from "react";
import { Plus, CalendarRange, LayoutGrid, Ticket, Users, TrendingUp, ArrowLeft, CalendarDays, MapPin, Pencil, Trash2 } from "lucide-react";
import { useEvents } from "../context/EventsContext";
import { useAuth } from "../context/AuthContext";
import EventCard from "../components/EventCard";
import EventForm from "../components/EventForm";
import ConfirmDialog from "../components/ConfirmDialog";
import TaskForm from "../components/TaskForm";
import CategorySection from "../components/CategorySection";
import EventTimeline from "../components/EventTimeline";
import ProgressStamp from "../components/ProgressStamp";
import { progressOf, formatDate } from "../utils/helpers";
import { CATEGORIES } from "../utils/helpers";
import { Link } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import { Search } from "lucide-react";

export default function Dashboard() {
  const { events, createEvent, updateEvent, deleteEvent, addTask, updateTask, toggleTask, deleteTask } = useEvents();
  const { user, isAdmin } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
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

  const overallPct =
    stats.totalTasks === 0
      ? 0
      : Math.round((stats.doneTasks / stats.totalTasks) * 100);

return (
    <div className="relative">
      {/* Ambient background orbs */}
      <div className="ambient-bg">
        <div className="orb orb-rose" />
        <div className="orb orb-purple" />
        <div className="orb orb-emerald" />
      </div>

{isAdmin ? (
        // Full dashboard for admins
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6">
          {selectedEvent ? (
            // Event detail view when an event is selected
            <EventDetailView
              event={selectedEvent}
              onBack={() => setSelectedEvent(null)}
              onEdit={(event) => {
                setEditingEvent(event);
                setSelectedEvent(null);
              }}
              onDelete={(event) => {
                setDeletingEvent(event);
                setSelectedEvent(null);
              }}
              onToggleTask={(taskId) => {
                toggleTask(selectedEvent.id, taskId);
              }}
              onAddTask={(taskData) => {
                addTask(selectedEvent.id, taskData);
              }}
              onEditTask={(task) => {
                updateTask(selectedEvent.id, task.id, task);
              }}
              onDeleteTask={(task) => {
                deleteTask(selectedEvent.id, task.id);
              }}
            />
          ) : (
            // Regular dashboard view
            <>
              {/* ── Hero ─────────────────────────────────────── */}
              <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between mb-10">
                <div>
                  <span
                    className="inline-flex items-center gap-1.5 mb-3 text-[11px] uppercase tracking-widest font-semibold rounded-full px-3 py-1"
                    style={{
                      color: "#4f46e5",
                      background: "rgba(79,70,229,0.06)",
                      border: "1px solid rgba(79,70,229,0.15)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    ✦ Dashboard
                  </span>
                  <h1
                    className="text-4xl font-extrabold leading-tight sm:text-6xl"
                    style={{ fontFamily: "'Sora', sans-serif", color: "#0f172a" }}
                  >
                    Every event,{" "}
                    <span className="text-shimmer">on one clipboard.</span>
                  </h1>
                  <p className="mt-4 max-w-xl text-lg font-semibold leading-relaxed" style={{ color: "#475569" }}>
                    Plan the run of show, track who has done what, and never miss a
                    before, during, or after task again.
                  </p>
                </div>
                <button
                  className="btn-accent self-start shrink-0"
                  onClick={() => setShowCreate(true)}
                >
                  <Plus size={16} />
                  New Event
                </button>
              </div>

              {/* ── Stat cards ─────────────────────────────── */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-10">
                <StatCard
                  label="Events"
                  value={stats.totalEvents}
                  icon={<LayoutGrid size={20} />}
                  color="#4f46e5"
                  glow="rgba(79,70,229,0.15)"
                  ink="#1e1b4b"
                />
                <StatCard
                  label="Upcoming"
                  value={stats.upcoming}
                  icon={<CalendarRange size={20} />}
                  color="#7c3aed"
                  glow="rgba(124,58,237,0.15)"
                  ink="#2e1065"
                />
                <StatCard
                  label="Total Tasks"
                  value={stats.totalTasks}
                  icon={<TrendingUp size={20} />}
                  color="#64748b"
                  glow="rgba(100,116,139,0.12)"
                  ink="#334155"
                />
                <StatCard
                  label="Completed"
                  value={`${stats.doneTasks}/${stats.totalTasks || 0}`}
                  icon={null}
                  color="#10b981"
                  glow="rgba(16,185,129,0.15)"
                  accent
                  pct={overallPct}
                  ink="#065f46"
                />
              </div>

              {/* ── Next upcoming event ─────────────────────── */}
              {upcomingEvent && !searchQuery && (
                <div className="mb-10 animate-fadeIn">
                  <div className="flex items-center gap-3 mb-4">
                    <h2
                      className="text-xl font-bold"
                      style={{ fontFamily: "'Sora', sans-serif", color: "#0f172a" }}
                    >
                      Next Up
                    </h2>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(79,70,229,0.06)",
                        border: "1px solid rgba(79,70,229,0.15)",
                        color: "#4f46e5",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      upcoming
                    </span>
                  </div>

                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: "#ffffff",
                      border: "1px solid rgba(15,23,42,0.08)",
                      boxShadow: "0 4px 32px -8px rgba(79,70,229,0.12), 0 1px 3px rgba(15,23,42,0.06)",
                    }}
                  >
                    {/* Accent top line */}
                    <div
                      className="h-px"
                      style={{
                        background: "linear-gradient(90deg, transparent, rgba(79,70,229,0.5), rgba(124,58,237,0.35), transparent)",
                      }}
                    />

                    <div className="p-6 sm:p-8 flex flex-col gap-8">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3
                            className="text-2xl font-bold"
                            style={{ fontFamily: "'Sora', sans-serif", color: "#0f172a" }}
                          >
                            {upcomingEvent.name}
                          </h3>
                          <span
                            className="text-xs font-semibold px-3 py-1 rounded-full"
                            style={{
                              background: "rgba(245,158,11,0.08)",
                              border: "1px solid rgba(245,158,11,0.2)",
                              color: "#b45309",
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            📅 {formatDate(upcomingEvent.date)}
                          </span>
                        </div>
                        <p className="text-base font-medium mb-6 max-w-lg leading-relaxed" style={{ color: "#475569" }}>
                          {upcomingEvent.description || "No description provided."}
                        </p>
                        <div className="mb-6">
                          <ProgressBar
                            done={progressOf(upcomingEvent).done}
                            total={progressOf(upcomingEvent).total}
                            size="lg"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-semibold" style={{ color: "#64748b" }}>
                            Registrations: {upcomingEvent.registrations || 0}
                          </span>
                          <span className="text-base font-semibold" style={{ color: "#64748b" }}>
                            Team: {upcomingEvent.teamMembers || "Unassigned"}
                          </span>
                        </div>
                        <Link to={`/event/${upcomingEvent.id}`} className="btn-primary mt-4">
                          Manage Event →
                        </Link>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                          { icon: <Ticket size={14} />, label: "Registrations", value: upcomingEvent.registrations || 0 },
                          { icon: <Users size={14} />, label: "Team", value: upcomingEvent.teamMembers || "Unassigned" },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-xl p-5"
                            style={{
                              background: "rgba(79,70,229,0.04)",
                              border: "1px solid rgba(79,70,229,0.1)",
                              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
                            }}
                          >
                            <div
                              className="flex items-center gap-1.5 mb-2 text-xs uppercase tracking-wider font-semibold"
                              style={{
                                color: "#64748b",
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              {item.icon} {item.label}
                            </div>
                            <div className="text-2xl font-bold" style={{ fontFamily: "'Sora', sans-serif", color: "#1e1b4b" }}>
                              {item.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Events list ────────────────────────────── */}
              <div>
                <div className="mb-6">
                  <h2
                    className="text-xl font-bold mb-4"
                    style={{ fontFamily: "'Sora', sans-serif", color: "#0f172a" }}
                  >
                    All Events
                  </h2>
                  <div className="relative w-full max-w-sm sm:max-w-md">
                    <Search
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: "#94a3b8" }}
                    />
                    <input
                      type="text"
                      placeholder="Search events by name or location…"
                      className="search-input pl-11 pr-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        aria-label="Clear search"
                        className="absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full transition-all duration-150"
                        style={{ color: "#94a3b8", background: "rgba(0,0,0,0.05)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(79,70,229,0.1)";
                          e.currentTarget.style.color = "#4f46e5";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(0,0,0,0.05)";
                          e.currentTarget.style.color = "#94a3b8";
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {sortedEvents.length === 0 ? (
                  searchQuery ? (
                    <div
                      className="text-center py-12 rounded-2xl border"
                      style={{
                        color: "#64748b",
                        borderColor: "rgba(15,23,42,0.08)",
                        background: "#ffffff",
                      }}
                    >
                      No events matching &ldquo;{searchQuery}&rdquo;
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
                        onSelect={() => setSelectedEvent(event)}
                      />
                    ))}
                  </div>
                )}
              </div>

            </>
          )}

        {/* ── Modals ─────────────────────────────────── */}
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
      ) : (
        // Simplified view for non-admins (members and guests)
        <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 text-center">
          <div className="mb-12">
            <span
              className="inline-flex items-center gap-1.5 mb-3 text-[11px] uppercase tracking-widest font-semibold rounded-full px-3 py-1"
              style={{
                color: "#4f46e5",
                background: "rgba(79,70,229,0.06)",
                border: "1px solid rgba(79,70,229,0.15)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              ✦ Welcome
            </span>
            <h1
              className="text-4xl font-extrabold leading-tight sm:text-6xl"
              style={{ fontFamily: "'Sora', sans-serif", color: "#0f172a" }}
            >
              Every event,{" "}
              <span className="text-shimmer">on one clipboard.</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg font-semibold leading-relaxed mx-auto" style={{ color: "#475569" }}>
              Plan the run of show, track who has done what, and never miss a
              before, during, or after task again.
            </p>
          </div>

          {!user ? (
            // Not logged in
            <div className="space-y-6">
              <p className="text-xl max-w-xl mx-auto" style={{ color: "#64748b" }}>
                Please log in to access event management features.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/login"
                  className="btn-secondary px-6 py-3"
                >
                  Member Login
                </Link>
                <Link
                  to="/admin/login"
                  className="btn-accent px-6 py-3"
                >
                  Admin Login
                </Link>
              </div>
            </div>
          ) : (
            // Logged in member
            <div className="space-y-6">
              <p className="text-xl max-w-xl mx-auto" style={{ color: "#64748b" }}>
                Welcome back, {user?.name?.split(' ')[0] || 'team member'}! 
                Access your assigned tasks from the member portal.
              </p>
              <Link
                to="/me"
                className="btn-accent px-6 py-3"
              >
                Go to My Tasks
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── StatCard ─────────────────────────────────────── */
function StatCard({ label, value, icon, color, glow, accent, pct, ink }) {
  return (
    <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,23,42,0.08)",
        minHeight: 130,
        boxShadow: `0 4px 24px -4px ${glow || "rgba(15,23,42,0.05)"}, inset 0 1px 0 rgba(255,255,255,0.9)`,
      }}
    >
      {/* Background glow spot */}
      <div
        className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${glow || "rgba(79,70,229,0.1)"} 0%, transparent 70%)`,
        }}
      />
      <div className="relative">
        <div
          className="flex items-center gap-2 mb-3 text-sm uppercase tracking-widest font-semibold"
          style={{
            color: color || "#64748b",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {icon}
          {label}
        </div>
        <p
          className="text-3xl font-bold leading-none sm:text-4xl"
          style={{
            fontFamily: "'Sora', sans-serif",
            color: ink || "#0f172a",
          }}
        >
          {value}
        </p>
        {accent && pct !== undefined && (
          <div
            className="mt-2 h-1 rounded-full overflow-hidden"
            style={{ background: "rgba(15,23,42,0.06)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${pct}%`,
                background: `linear-gradient(90deg, ${color}, #34d399)`,
                boxShadow: `0 0 8px ${glow}`,
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── EmptyState ──────────────────────────────────── */
function EmptyState({ onCreate }) {
  return (
    <div
      className="flex flex-col items-center gap-5 border border-dashed rounded-2xl px-6 py-20 text-center"
      style={{ borderColor: "rgba(79,70,229,0.2)", background: "#ffffff" }}
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          background: "rgba(79,70,229,0.08)",
          border: "1px solid rgba(79,70,229,0.15)",
        }}
      >
        <CalendarRange size={28} style={{ color: "#4f46e5" }} />
      </div>
      <div>
        <h3
          className="text-3xl font-extrabold mb-3"
          style={{ fontFamily: "'Sora', sans-serif", color: "#0f172a" }}
        >
          No events yet
        </h3>
        <p className="max-w-sm text-base font-medium leading-relaxed" style={{ color: "#64748b" }}>
          Create your first event to start organizing tasks and tracking progress.
        </p>
      </div>
      <button className="btn-accent mt-2 text-base !px-6 !py-3" onClick={onCreate}>
        <Plus size={18} />
        Create your first event
      </button>
    </div>
  );
}

/* ── EventDetailView ───────────────────────────── */
function EventDetailView({
  event,
  onBack,
  onEdit,
  onDelete,
  onToggleTask,
  onAddTask,
  onEditTask,
  onDeleteTask,
}) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);

  const { done, total, pct } = progressOf(event);

  const grouped = useMemo(() => {
    const g = {};
    CATEGORIES.forEach((c) => (g[c.key] = []));
    (event.tasks || []).forEach((t) => {
      if (!g[t.category]) g[t.category] = [];
      g[t.category].push(t);
    });
    return g;
  }, [event]);

  return (
    <div className="animate-fadeIn">
      {/* Back link */}
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
        style={{ color: "#64748b", background: "transparent" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
      >
        <ArrowLeft size={15} />
        All events
      </button>

      {/* ── Event hero card ─────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden mb-8"
        style={{
          background: "linear-gradient(135deg, #eef2ff 0%, #faf5ff 100%)",
          border: "1px solid rgba(79,70,229,0.15)",
          minHeight: 260,
          boxShadow: "0 4px 32px -8px rgba(79,70,229,0.12), 0 1px 3px rgba(15,23,42,0.06)",
        }}
      >
        <div
          className="h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(79,70,229,0.5), rgba(124,58,237,0.35), transparent)",
          }}
        />

        <div className="p-8 sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1
                className="text-4xl font-extrabold sm:text-5xl leading-tight mb-4"
                style={{ fontFamily: "'Sora', sans-serif", color: "#1e1b4b" }}
              >
                {event.name}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span
                  className="inline-flex items-center gap-1.5 text-base font-bold px-4 py-2 rounded-full"
                  style={{
                    background: "#ffffff",
                    border: "1px solid rgba(79,70,229,0.2)",
                    color: "#4338ca",
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
                      background: "#ffffff",
                      border: "1px solid rgba(79,70,229,0.2)",
                      color: "#4338ca",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    <MapPin size={11} />
                    {event.location}
                  </span>
                )}
              </div>

              {event.description && (
                <p className="text-base font-medium max-w-xl leading-relaxed" style={{ color: "#475569" }}>
                  {event.description}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-4 self-start">
              <ProgressStamp pct={pct} size="xl" />
              <div className="flex flex-col gap-2">
                <button
                  className="!px-4 !py-2 text-sm font-semibold rounded-full transition-all duration-200"
                  onClick={() => onEdit(event)}
                  style={{
                    color: "#4338ca",
                    background: "#ffffff",
                    border: "1px solid rgba(79,70,229,0.25)",
                    boxShadow: "0 1px 3px rgba(15,23,42,0.06)",
                  }}
                >
                  <Pencil size={14} />
                  Edit
                </button>
                <button
                  className="!px-4 !py-2 text-sm font-semibold rounded-full transition-all duration-200"
                  onClick={() => onDelete(event)}
                  style={{
                    color: "#dc2626",
                    background: "rgba(220,38,38,0.08)",
                    border: "1px solid rgba(220,38,38,0.25)",
                  }}
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              </div>
            </div>
          </div>

          <ProgressBar done={done} total={total} className="mt-6" light size="lg" />
        </div>
      </div>

      {/* ── Timeline ───────────────────────────── */}
      <div className="mb-8">
        <EventTimeline tasks={event.tasks} onToggle={onToggleTask} />
      </div>

      {/* ── Checklist header ───────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2
            className="text-xl font-bold text-slate-900"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Checklist
          </h2>
          <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.16)",
              color: "#059669",
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
            onToggle={onToggleTask}
            onEdit={(task) => setEditingTask(task)}
            onDelete={(task) => setDeletingTask(task)}
          />
        ))}
      </div>

      {/* ── Task modals ────────────────────────── */}
      {showAddTask && (
        <TaskForm
          onClose={() => setShowAddTask(false)}
          onSubmit={(data) => {
            onAddTask(data);
            setShowAddTask(false);
          }}
        />
      )}
      {editingTask && (
        <TaskForm
          initial={editingTask}
          onClose={() => setEditingTask(null)}
          onSubmit={(data) => {
            onEditTask({ ...editingTask, ...data });
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
            onDeleteTask(deletingTask);
            setDeletingTask(null);
          }}
        />
      )}
    </div>
  );
}