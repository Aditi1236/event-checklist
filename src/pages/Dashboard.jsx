import { useMemo, useState } from "react";
import { Plus, CalendarRange, LayoutGrid, DollarSign, Ticket, Users, TrendingUp } from "lucide-react";
import { useEvents } from "../context/EventsContext";
import { useAuth } from "../context/AuthContext";
import EventCard from "../components/EventCard";
import EventForm from "../components/EventForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { progressOf, formatDate } from "../utils/helpers";
import { Link } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import { Search } from "lucide-react";

export default function Dashboard() {
  const { events, createEvent, updateEvent, deleteEvent, toggleTask } = useEvents();
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
                // We'll implement this in EventDetailView
              }}
              onAddTask={(taskData) => {
                // We'll implement this in EventDetailView
              }}
              onEditTask={(task) => {
                // We'll implement this in EventDetailView
              }}
              onDeleteTask={(task) => {
                // We'll implement this in EventDetailView
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
                      color: "#a855f7",
                      background: "rgba(168,85,247,0.1)",
                      border: "1px solid rgba(168,85,247,0.2)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    ✦ Dashboard
                  </span>
                  <h1
                    className="text-4xl font-extrabold leading-tight text-white sm:text-6xl"
                    style={{ fontFamily: "'Sora', sans-serif" }}
                  >
                    Every event,{" "}
                    <span className="text-shimmer">on one clipboard.</span>
                  </h1>
                  <p className="mt-4 max-w-xl text-lg font-semibold text-white leading-relaxed">
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
                  color="#e11d6a"
                  glow="rgba(225,29,106,0.25)"
                  gradient="linear-gradient(180deg, #a9caff 0%, #b8cbff 16.667%, #d3cbff 33.333%, #f0c8f9 50%, #ffc5f1 66.667%, #ffc0ec 83.333%, #ffbaec 100%)"
                  ink="#000000"
                />
                <StatCard
                  label="Upcoming"
                  value={stats.upcoming}
                  icon={<CalendarRange size={20} />}
                  color="#a855f7"
                  glow="rgba(168,85,247,0.25)"
                  gradient="linear-gradient(180deg, #a9caff 0%, #b8cbff 16.667%, #d3cbff 33.333%, #f0c8f9 50%, #ffc5f1 66.667%, #ffc0ec 83.333%, #ffbaec 100%)"
                  ink="#111844"
                />
                <StatCard
                  label="Total Tasks"
                  value={stats.totalTasks}
                  icon={<TrendingUp size={20} />}
                  color="#64748b"
                  glow="rgba(100,116,139,0.2)"
                  gradient="linear-gradient(180deg, #a9caff 0%, #b8cbff 16.667%, #d3cbff 33.333%, #f0c8f9 50%, #ffc5f1 66.667%, #ffc0ec 83.333%, #ffbaec 100%)"
                  ink="#450C3F"
                />
                <StatCard
                  label="Completed"
                  value={`${stats.doneTasks}/${stats.totalTasks || 0}`}
                  icon={null}
                  color="#10b981"
                  glow="rgba(16,185,129,0.25)"
                  gradient="linear-gradient(180deg, #a9caff 0%, #b8cbff 16.667%, #d3cbff 33.333%, #f0c8f9 50%, #ffc5f1 66.667%, #ffc0ec 83.333%, #ffbaec 100%)"
                  accent
                  pct={overallPct}
                  ink="#063B00"
                />
              </div>

              {/* ── Next upcoming event ─────────────────────── */}
              {upcomingEvent && !searchQuery && (
                <div className="mb-10 animate-fadeIn">
                  <div className="flex items-center gap-3 mb-4">
                    <h2
                      className="text-xl font-bold text-white"
                      style={{ fontFamily: "'Sora', sans-serif" }}
                    >
                      Next Up
                    </h2>
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(225,29,106,0.12)",
                        border: "1px solid rgba(225,29,106,0.25)",
                        color: "#fb7aaa",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      upcoming
                    </span>
                  </div>

                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: "#30AFFF",
                      border: "1px solid rgba(255,255,255,0.2)",
                      backdropFilter: "blur(20px)",
                      boxShadow: "0 4px 40px -8px rgba(48,175,255,0.4), 0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  >
                    {/* Rose accent top line */}
                    <div
                      className="h-px"
                      style={{
                        background: "linear-gradient(90deg, transparent, rgba(225,29,106,0.7), rgba(168,85,247,0.5), transparent)",
                      }}
                    />

                    <div className="p-6 sm:p-8 flex flex-col gap-8">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <h3
                            className="text-2xl font-bold text-white"
                            style={{ fontFamily: "'Sora', sans-serif" }}
                          >
                            {upcomingEvent.name}
                          </h3>
                          <span
                            className="text-xs font-semibold px-3 py-1 rounded-full"
                            style={{
                              background: "rgba(245,158,11,0.12)",
                              border: "1px solid rgba(245,158,11,0.25)",
                              color: "#fbbf24",
                              fontFamily: "'JetBrains Mono', monospace",
                            }}
                          >
                            📅 {formatDate(upcomingEvent.date)}
                          </span>
                        </div>
                        <p className="text-base font-medium text-ink mb-6 max-w-lg leading-relaxed" style={{ color: "#cbd5e1" }}>
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
                            Budget: ${upcomingEvent.budget || 0}
                          </span>
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
                          { icon: <DollarSign size={14} />, label: "Budget", value: `$${upcomingEvent.budget || 0}` },
                          { icon: <Ticket size={14} />, label: "Registrations", value: upcomingEvent.registrations || 0 },
                          { icon: <Users size={14} />, label: "Team", value: upcomingEvent.teamMembers || "Unassigned" },
                        ].map((item) => (
                          <div
                            key={item.label}
                            className="rounded-xl p-5"
                            style={{
                              background: "linear-gradient(180deg, #a9caff 0%, #b8cbff 16.667%, #d3cbff 33.333%, #f0c8f9 50%, #ffc5f1 66.667%, #ffc0ec 83.333%, #ffbaec 100%)",
                              border: "1px solid rgba(255,255,255,0.12)",
                              boxShadow: "0 4px 24px -4px rgba(255,255,255,0.25), inset 0 1px 0 rgba(255,255,255,0.4)",
                            }}
                          >
                            <div
                              className="flex items-center gap-1.5 mb-2 text-xs uppercase tracking-wider font-semibold"
                              style={{
                                color: "rgba(20,18,40,0.7)",
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              {item.icon} {item.label}
                            </div>
                            <div className="text-2xl font-bold" style={{ fontFamily: "'Sora', sans-serif", color: "#1d1733" }}>
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
                    className="text-xl font-bold text-white mb-4"
                    style={{ fontFamily: "'Sora', sans-serif" }}
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
                        style={{ color: "#94a3b8", background: "rgba(255,255,255,0.08)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(225,29,106,0.15)";
                          e.currentTarget.style.color = "#fb7aaa";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(255,255,255,0.08)";
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
                        borderColor: "rgba(255,255,255,0.07)",
                        background: "rgba(255,255,255,0.02)",
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
            </>
          )}
        </div>
      ) : (
                <EmptyState onCreate={() => setShowCreate(true)} />
              )
            ) : (
<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                 {sortedEvents.map((event) => (
                   <EventCard
                     key={event.id}
                     event={event>
                     onEdit={() => setEditingEvent(event)}
                     onDelete={() => setDeletingEvent(event)}
                     onSelect={() => setSelectedEvent(event)}
                   />
                 ))}
               </div>
            )}
          </div>

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
                color: "#a855f7",
                background: "rgba(168,85,247,0.1)",
                border: "1px solid rgba(168,85,247,0.2)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              ✦ Welcome
            </span>
            <h1
              className="text-4xl font-extrabold leading-tight text-white sm:text-6xl"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Every event,{" "}
              <span className="text-shimmer">on one clipboard.</span>
            </h1>
            <p className="mt-4 max-w-xl text-lg font-semibold text-white leading-relaxed">
              Plan the run of show, track who has done what, and never miss a
              before, during, or after task again.
            </p>
          </div>

          {!user ? (
            // Not logged in
            <div className="space-y-6">
              <p className="text-xl text-white-soft max-w-xl">
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
              <p className="text-xl text-white-soft max-w-xl">
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
function StatCard({ label, value, icon, color, glow, accent, pct, gradient, ink }) {
  return (
    <div
      className="rounded-2xl p-6 relative overflow-hidden"
      style={{
        background: gradient || "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
        backdropFilter: "blur(16px)",
        minHeight: 130,
        boxShadow: `0 4px 24px -4px ${glow || "rgba(0,0,0,0.3)"}, inset 0 1px 0 rgba(255,255,255,0.06)`,
      }}
    >
      {/* Background glow spot */}
      {!gradient && (
        <div
          className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${glow || "rgba(255,255,255,0.05)"} 0%, transparent 70%)`,
          }}
        />
      )}
      <div className="relative">
        <div
          className="flex items-center gap-2 mb-3 text-sm uppercase tracking-widest font-semibold"
          style={{
            color: gradient ? (ink || "rgba(20,18,40,0.75)") : color || "#64748b",
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
            color: gradient ? (ink || "#1d1733") : accent ? color : "#f1f5f9",
            textShadow: gradient ? "none" : accent ? `0 0 20px ${glow}` : "none",
          }}
        >
          {value}
        </p>
        {accent && pct !== undefined && (
          <div
            className="mt-2 h-1 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.07)" }}
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
      style={{ borderColor: "rgba(255,255,255,0.35)", background: "#3A86FF" }}
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-2xl"
        style={{
          background: "rgba(225,29,106,0.18)",
          border: "1px solid rgba(225,29,106,0.35)",
          boxShadow: "0 0 24px rgba(225,29,106,0.3)",
        }}
      >
        <CalendarRange size={28} style={{ color: "#fb7aaa" }} />
      </div>
      <div>
        <h3
          className="text-3xl font-extrabold text-white mb-3"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          No events yet
        </h3>
        <p className="max-w-sm text-base font-medium leading-relaxed" style={{ color: "#cbd5e1" }}>
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
