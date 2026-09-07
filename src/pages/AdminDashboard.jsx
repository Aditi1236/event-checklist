import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  CalendarRange,
  CheckSquare,
  Users,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  UserPlus,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useEvents } from "../context/EventsContext";
import { useAuth } from "../context/AuthContext";
import apiClient from "../utils/api";
import EventForm from "../components/EventForm";
import TaskForm from "../components/TaskForm";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import ProgressBar from "../components/ProgressBar";
import { statusMeta, taskStatus, eventTypeMeta, formatDate, progressOf } from "../utils/helpers";

const TABS = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "events", label: "Events & Bootcamps", icon: CalendarRange },
  { key: "tasks", label: "Assigned Tasks", icon: CheckSquare },
  { key: "members", label: "Members", icon: Users },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const [summary, setSummary] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [busy, setBusy] = useState(true);

  const { user, members, refreshMembers } = useAuth();
  const { events, createEvent, updateEvent, deleteEvent, addTask, updateTask, deleteTask, toggleTask } = useEvents();

  const refresh = async () => {
    try {
      const [s, t] = await Promise.all([apiClient.getAdminSummary(), apiClient.listTasks()]);
      setSummary(s);
      setTasks(Array.isArray(t) ? t : []);
    } catch (err) {
      console.error("Admin data refresh failed", err);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    refresh();
    refreshMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      refresh();
      refreshMembers();
    }, 8000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const memberById = useMemo(() => {
    const map = {};
    members.forEach((m) => (map[m.id] = m));
    return map;
  }, [members]);

  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)),
    [tasks]
  );

  const overall = summary || {
    events: 0,
    members: 0,
    admins: 0,
    tasks: { total: 0, pending: 0, inProgress: 0, completed: 0 },
    overallProgress: 0,
    eventProgress: [],
    memberLoad: [],
    upcoming: [],
  };

  return (
    <div className="relative">
      <div className="ambient-bg">
        <div className="orb orb-rose" />
        <div className="orb orb-purple" />
        <div className="orb orb-emerald" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
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
              <ShieldCheck size={13} /> Admin Control Center
            </span>
            <h1
              className="text-3xl font-extrabold text-white sm:text-4xl"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Welcome, {user?.name?.split(" ")[0] || "Admin"}
            </h1>
            <p className="mt-2 text-sm font-medium" style={{ color: "#94a3b8" }}>
              Full control over NexaSoul events, bootcamps, tasks, members and progress.
            </p>
          </div>
          {busy && (
            <span className="inline-flex items-center gap-2 text-xs font-semibold" style={{ color: "#94a3b8" }}>
              <Loader2 size={14} className="animate-spin" /> Syncing…
            </span>
          )}
        </div>
{/* Tabs */}
        <div className="mb-8 flex flex-wrap gap-2">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200"
                style={
                  active
                    ? {
                        color: "#ffffff",
                        background: "linear-gradient(135deg, #e11d6a, #a855f7)",
                        boxShadow: "0 4px 20px rgba(225,29,106,0.35)",
                      }
                    : { color: "#94a3b8", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }
                }
              >
                <t.icon size={15} />
                {t.label}
              </button>
            );
          })}
        </div>

        {tab === "overview" && (
          <OverviewTab
            summary={overall}
            onManageEvents={() => setTab("events")}
            onManageTasks={() => setTab("tasks")}
            onManageMembers={() => setTab("members")}
          />
        )}
        {tab === "events" && (
          <EventsTab
            events={events}
            createEvent={createEvent}
            updateEvent={updateEvent}
            deleteEvent={deleteEvent}
          />
        )}
        {tab === "tasks" && (
          <TasksTab
            tasks={sortedTasks}
            events={events}
            members={members}
            memberById={memberById}
            addTask={addTask}
            updateTask={updateTask}
            deleteTask={deleteTask}
            toggleTask={toggleTask}
          />
        )}
        {tab === "members" && (
          <MembersTab members={members} refreshMembers={refreshMembers} currentUser={user} />
        )}
      </div>
    </div>
  );
}
/* ═════════─────── Overview tab ───────═════════ */
function OverviewTab({ summary, onManageEvents, onManageTasks, onManageMembers }) {
  const totalTasks = summary.tasks.total || 0;
  const pct = summary.overallProgress || 0;

  const stats = [
    { label: "Events & Bootcamps", value: summary.events, icon: <CalendarRange size={20} />, color: "#e11d6a", glow: "rgba(225,29,106,0.25)", onClick: onManageEvents },
    { label: "Members", value: summary.members, icon: <Users size={20} />, color: "#a855f7", glow: "rgba(168,85,247,0.25)", onClick: onManageMembers },
    { label: "Total Tasks", value: totalTasks, icon: <CheckSquare size={20} />, color: "#64748b", glow: "rgba(100,116,139,0.2)", onClick: onManageTasks },
    { label: "Completed", value: `${summary.tasks.completed}/${totalTasks || 0}`, icon: <TrendingUp size={20} />, color: "#10b981", glow: "rgba(16,185,129,0.25)", onClick: onManageTasks },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
{stats.map((s) => (
           <button
             key={s.label}
             onClick={s.onClick}
             className="rounded-2xl p-6 text-left relative overflow-hidden transition-all duration-200 hover:-translate-y-0.5"
             style={{
               background: "#622569",
               border: "1px solid rgba(255,255,255,0.08)",
               backdropFilter: "blur(16px)",
               boxShadow: `0 4px 24px -4px ${s.glow}, inset 0 1px 0 rgba(255,255,255,0.06)`,
             }}
           >
             <div
               className="absolute -top-6 -right-6 w-20 h-20 rounded-full pointer-events-none"
               style={{ background: `radial-gradient(circle, ${s.glow} 0%, transparent 70%)` }}
             />
             <div
               className="flex items-center gap-2 mb-3 text-xs uppercase tracking-widest font-semibold"
               style={{ color: s.color, fontFamily: "'JetBrains Mono', monospace" }}
             >
               {s.icon} {s.label}
             </div>
             <p className="text-3xl font-bold" style={{ color: "#f1f5f9", fontFamily: "'Sora', sans-serif" }}>
               {s.value}
             </p>
           </button>
         ))}
      </div>

{/* Overall progress */}
       <div
         className="rounded-2xl p-8"
         style={{
           background: "#622569",
           border: "1px solid rgba(255,255,255,0.08)",
           backdropFilter: "blur(16px)",
         }}
       >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
            Overall Task Progress
          </h2>
          <span
            className="text-sm font-black"
            style={{
              color: pct === 100 ? "#34d399" : "#fb7aaa",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {pct}%
          </span>
        </div>
        <ProgressBar done={summary.tasks.completed} total={totalTasks} size="lg" />
<div className="mt-6 grid grid-cols-3 gap-3">
           {[
             { label: "Pending", value: summary.tasks.pending, color: "#94a3b8" },
             { label: "In Progress", value: summary.tasks.inProgress, color: "#fbbf24" },
             { label: "Completed", value: summary.tasks.completed, color: "#34d399" },
           ].map((x) => (
             <div
               key={x.label}
               className="rounded-xl px-4 py-3 text-center"
               style={{ background: "#622569", border: "1px solid rgba(255,255,255,0.08)" }}
             >
               <p className="text-2xl font-extrabold" style={{ color: x.color, fontFamily: "'Sora', sans-serif" }}>
                 {x.value}
               </p>
               <p className="mt-1 text-[10px] uppercase tracking-widest font-semibold" style={{ color: "#94a3b8" }}>
                 {x.label}
               </p>
             </div>
           ))}
         </div>
      </div>
{/* Event progress */}
       <div>
         <div className="mb-4 flex items-center justify-between">
           <h2 className="text-xl font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
             Event Progress
           </h2>
           <button className="btn-ghost !py-1.5 !px-3 text-xs" onClick={onManageEvents}>
             Manage events
           </button>
         </div>
         <div className="space-y-3">
           {(summary.eventProgress || []).map((ep) => {
             const type = eventTypeMeta(ep.type || "event");
             return (
               <div
                 key={ep.id}
                 className="flex flex-col gap-3 rounded-xl px-6 py-5 sm:flex-row sm:items-center"
                 style={{ background: "#622569", border: "1px solid rgba(255,255,255,0.08)" }}
               >
                 <div className="min-w-0 flex-1">
                   <div className="flex items-center gap-2">
                     <p className="truncate text-sm font-bold text-white">{ep.name}</p>
                     <span
                       className="shrink-0 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest"
                       style={{ color: "#ffffff", background: type.color, fontFamily: "'JetBrains Mono', monospace" }}
                     >
                       {type.label}
                     </span>
                   </div>
                   <p className="mt-1 text-sm" style={{ color: "#94a3b8" }}>
                     {ep.date ? formatDate(ep.date) : "No date"} {ep.location ? ` · ${ep.location}` : ""}
                   </p>
                 </div>
                 <div className="flex items-center gap-3 sm:w-64">
                   <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                     <div
                       className="h-full rounded-full transition-all duration-500"
                       style={{
                         width: `${ep.pct}%`,
                         background: "linear-gradient(90deg, #e11d6a, #a855f7, #10b981)",
                         boxShadow: "0 0 8px rgba(225,29,106,0.4)",
                       }}
                     />
                   </div>
                   <span className="w-12 text-right text-sm font-bold" style={{ color: "#f1f5f9", fontFamily: "'JetBrains Mono', monospace" }}>
                     {ep.pct}%
                   </span>
                 </div>
               </div>
             );
           })}
           {(summary.eventProgress || []).length === 0 && (
             <p className="rounded-xl border border-dashed px-6 py-10 text-center text-sm" style={{ color: "#64748b", borderColor: "rgba(255,255,255,0.15)" }}>
               No events yet. Create one to get started.
             </p>
           )}
         </div>
       </div>
{/* Member workload */}
       <div>
         <div className="mb-4 flex items-center justify-between">
           <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
             Member Workload
           </h2>
           <button className="btn-ghost !py-1.5 !px-3 text-xs" onClick={onManageMembers}>
             Manage members
           </button>
         </div>
         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
           {(summary.memberLoad || []).filter((m) => m.role !== "admin").map((m) => (
             <div
               key={m.userId}
               className="rounded-xl px-6 py-5"
               style={{ background: "#622569", border: "1px solid rgba(255,255,255,0.08)" }}
             >
               <div className="flex items-center justify-between gap-2">
                 <p className="text-base font-bold text-white">{m.name}</p>
                 <span
                   className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                   style={{
                     color: m.total === 0 ? "#94a3b8" : "#fb7aaa",
                     background: "rgba(225,29,106,0.1)",
                     border: "1px solid rgba(225,29,106,0.2)",
                     fontFamily: "'JetBrains Mono', monospace",
                   }}
                 >
                   {m.completed}/{m.total} done
                 </span>
               </div>
               <p className="mt-1 text-sm" style={{ color: "#94a3b8" }}>
                 {m.position || "Member"}
               </p>
               <div className="mt-2 flex gap-3 text-[10px] font-semibold" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                 <span style={{ color: "#94a3b8" }}>⏳ {m.pending} pending</span>
                 <span style={{ color: "#fbbf24" }}>◇ {m.inProgress} in progress</span>
               </div>
             </div>
           ))}
           {(summary.memberLoad || []).filter((m) => m.role !== "admin").length === 0 && (
             <p className="rounded-xl border border-dashed px-6 py-10 text-center text-sm sm:col-span-2" style={{ color: "#64748b", borderColor: "rgba(255,255,255,0.15)" }}>
               No members yet. Create member accounts to start assigning tasks.
             </p>
           )}
         </div>
       </div>

{/* Upcoming events */}
       {(summary.upcoming || []).length > 0 && (
         <div>
           <h2 className="mb-4 text-lg font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
             Upcoming Events
           </h2>
           <div className="flex flex-wrap gap-3">
             {(summary.upcoming || []).map((ev) => {
               const type = eventTypeMeta(ev.type || "event");
               return (
                 <div
                   key={ev.id}
                   className="flex items-center gap-3 rounded-xl px-4 py-3"
                   style={{ background: "#622569", border: "1px solid rgba(255,255,255,0.08)" }}
                 >
                   <span
                     className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest"
                     style={{ color: "#ffffff", background: type.color, fontFamily: "'JetBrains Mono', monospace" }}
                   >
                     {type.label}
                   </span>
                   <div className="flex-1">
                     <p className="mt-0.5 text-xs" style={{ color: "#94a3b8" }}>
                       {ev.date ? formatDate(ev.date) : "No date"} {ev.location ? ` · ${ev.location}` : ""}
                     </p>
                   </div>
                   <div className="flex-1">
                     <ProgressBar done={ev.progress || 0} total={100} size="sm" className="mt-2" />
                   </div>
                 </div>
               )}
             )}
           </div>
         </div>
       )}
    </div>
  );
}

/* ═════════─────── Events tab ───────═════════ */
function EventsTab({ events, createEvent, updateEvent, deleteEvent }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const sorted = [...events].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date) - new Date(b.date);
  });

return (
     <div className="animate-fadeIn">
       <div className="mb-6 flex items-center justify-between">
         <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
           All Events & Bootcamps <span className="ml-1 text-base font-mono font-bold" style={{ color: "#94a3b8" }}>({sorted.length})</span>
         </h2>
         <button className="btn-accent" onClick={() => setShowCreate(true)}>
           <Plus size={16} /> New Event / Bootcamp
         </button>
       </div>

       <div className="space-y-3">
         {sorted.map((evt) => {
           const { done, total, pct } = progressOf(evt);
           const type = eventTypeMeta(evt.type || "event");
           return (
             <div
               key={evt.id}
               className="flex flex-col gap-4 rounded-xl px-6 py-5 sm:flex-row sm:items-center"
               style={{ background: "#622569", border: "1px solid rgba(255,255,255,0.08)" }}
             >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-bold text-white">{evt.name}</p>
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest"
                    style={{ color: "#ffffff", background: type.color, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {type.label}
                  </span>
                  {evt.type === "bootcamp" && evt.mode && (
                    <span className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: "#94a3b8", background: "rgba(255,255,255,0.07)", fontFamily: "'JetBrains Mono', monospace" }}>
                      {evt.mode}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs" style={{ color: "#94a3b8" }}>
                  {evt.date ? formatDate(evt.date) : "No date"}
                  {evt.type === "bootcamp" && evt.endDate ? ` → ${formatDate(evt.endDate)}` : ""}
                  {evt.location ? ` · ${evt.location}` : ""}
                </p>
              </div>

              <div className="flex items-center gap-5">
                <div className="hidden items-center gap-3 sm:flex sm:w-48">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: "linear-gradient(90deg, #e11d6a, #a855f7, #10b981)" }}
                    />
                  </div>
                  <span className="w-10 text-right text-xs font-bold" style={{ color: "#f1f5f9", fontFamily: "'JetBrains Mono', monospace" }}>
                    {pct}%
                  </span>
                </div>
                <span className="text-sm font-bold" style={{ color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
                  {done}/{total}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditing(evt)}
                    className="rounded-full p-2.5 transition-all duration-150"
                    style={{ color: "#64748b", background: "rgba(255,255,255,0.05)" }}
                    aria-label={`Edit ${evt.name}`}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.15)"; e.currentTarget.style.color = "#c084fc"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#64748b"; }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleting(evt)}
                    className="rounded-full p-2.5 transition-all duration-150"
                    style={{ color: "#64748b", background: "rgba(255,255,255,0.05)" }}
                    aria-label={`Delete ${evt.name}`}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(225,29,106,0.15)"; e.currentTarget.style.color = "#fb7aaa"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#64748b"; }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {sorted.length === 0 && (
          <p className="rounded-xl border border-dashed px-6 py-12 text-center text-sm" style={{ color: "#64748b", borderColor: "rgba(255,255,255,0.15)" }}>
            No events or bootcamps yet. Create the first one.
          </p>
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
      {editing && (
        <EventForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={(data) => {
            updateEvent(editing.id, data);
            setEditing(null);
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete event?"
          message={`This removes "${deleting.name}" and all ${deleting.tasks?.length || 0} of its tasks. This can't be undone.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            deleteEvent(deleting.id);
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}

/* ═════════─────── Tasks tab ───────═════════ */
function TasksTab({ tasks, events, members, memberById, addTask, updateTask, deleteTask, toggleTask }) {
  const [statusFilter, setStatusFilter] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const filtered = tasks.filter((t) => {
    const st = taskStatus(t);
    if (statusFilter && st !== statusFilter) return false;
    if (eventFilter && t.eventId !== eventFilter) return false;
    if (assigneeFilter && t.assigneeId !== assigneeFilter) return false;
    return true;
  });

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
          All Assigned Tasks <span className="ml-1 text-base font-mono font-bold" style={{ color: "#94a3b8" }}>({filtered.length})</span>
        </h2>
        <button className="btn-accent" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Filters */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <select
          className="field-input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select
          className="field-input"
          value={eventFilter}
          onChange={(e) => setEventFilter(e.target.value)}
          aria-label="Filter by event"
        >
          <option value="">All events</option>
          {events.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
        <select
          className="field-input"
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          aria-label="Filter by assignee"
        >
          <option value="">All assignees</option>
          {members.filter((m) => m.role !== "admin").map((m) => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
      </div>

{/* Task list */}
       <div className="space-y-2">
         {filtered.map((t) => {
           const st = statusMeta(taskStatus(t));
           const assignee = memberById[t.assigneeId];
           const evt = events.find((e) => e.id === t.eventId);
           return (
             <div
               key={`${t.eventId}-${t.id}`}
               className="flex flex-col gap-2 rounded-xl px-5 py-4 sm:flex-row sm:items-center"
               style={{
                 background: "#622569",
                 border: "1px solid rgba(255,255,255,0.08)",
                 opacity: st.key === "completed" ? 0.7 : 1,
               }}
             >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className={`text-base font-bold text-white ${st.key === "completed" ? "line-through" : ""}`}>{t.title}</p>
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                    style={{ color: st.color, background: st.bg, border: `1px solid ${st.border}`, fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {st.label}
                  </span>
                </div>
                <p className="mt-1 text-sm truncate" style={{ color: "#94a3b8" }}>
                  {evt?.name || "Unknown event"}
                  {assignee ? ` · 👤 ${assignee.name}` : ""}
                  {t.dueDate ? ` · 📅 ${formatDate(t.dueDate)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="rounded-full px-4 py-2 text-sm font-bold transition-all duration-150"
                  style={{
                    color: st.key === "completed" ? "#94a3b8" : "#34d399",
                    background: st.key === "completed" ? "rgba(255,255,255,0.05)" : "rgba(16,185,129,0.1)",
                    border: `1px solid ${st.key === "completed" ? "rgba(255,255,255,0.1)" : "rgba(16,185,129,0.25)"}`,
                  }}
                  onClick={() => toggleTask(t.eventId, t.id)}
                  title={st.key === "completed" ? "Reopen task" : "Mark completed"}
                >
                  {st.key === "completed" ? "Reopen" : "Complete"}
                </button>
<button
                  onClick={() => setEditing(t)}
                  className="rounded-full p-2.5 transition-all duration-150"
                  style={{ color: "#64748b", background: "rgba(255,255,255,0.05)" }}
                  aria-label={`Edit task ${t.title}`}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.15)"; e.currentTarget.style.color = "#c084fc"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#64748b"; }}
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => setDeleting(t)}
                  className="rounded-full p-2 transition-all duration-150"
                  style={{ color: "#64748b", background: "rgba(255,255,255,0.05)" }}
                  aria-label={`Delete task ${t.title}`}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(225,29,106,0.15)"; e.currentTarget.style.color = "#fb7aaa"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#64748b"; }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="rounded-xl border border-dashed px-6 py-12 text-center text-sm" style={{ color: "#64748b", borderColor: "rgba(255,255,255,0.15)" }}>
            No tasks match the current filters.
          </p>
        )}
      </div>

      {showAdd && (
        <TaskForm
          members={members}
          events={events}
          onClose={() => setShowAdd(false)}
          onSubmit={(data) => {
            if (data.eventId) {
              addTask(data.eventId, data);
            }
            setShowAdd(false);
          }}
        />
      )}
      {editing && (
        <TaskForm
          initial={editing}
          members={members}
          events={events}
          onClose={() => setEditing(null)}
          onSubmit={(data) => {
            updateTask(editing.eventId, editing.id, data);
            setEditing(null);
          }}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete task?"
          message={`"${deleting.title}" will be removed from its checklist for good.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            deleteTask(deleting.eventId, deleting.id);
            setDeleting(null);
          }}
        />
      )}
    </div>
  );
}
/* ═══════════─────── Members tab ───────══════════ */
function MembersTab({ members, refreshMembers, currentUser }) {
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const sorted = [...members].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  async function handleCreate(data) {
    setSaving(true);
    setMessage("");
    try {
      await apiClient.createUser(data);
      await refreshMembers();
      setShowCreate(false);
    } catch (err) {
      setMessage(err.message || "Failed to create member");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(id, data) {
    setSaving(true);
    setMessage("");
    try {
      await apiClient.updateUser(id, data);
      await refreshMembers();
      setEditing(null);
    } catch (err) {
      setMessage(err.message || "Failed to update member");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setSaving(true);
    setMessage("");
    try {
      await apiClient.deleteUser(id);
      await refreshMembers();
      setDeleting(null);
    } catch (err) {
      setMessage(err.message || "Failed to delete member");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="animate-fadeIn">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
          Executive Members{" "}
          <span className="ml-1 text-sm font-mono" style={{ color: "#94a3b8" }}>
            ({members.filter((m) => m.role !== "admin").length})
          </span>
        </h2>
        <button className="btn-accent" onClick={() => setShowCreate(true)}>
          <UserPlus size={18} /> Add Member
        </button>
      </div>

      {message && (
        <p
          className="mb-4 rounded-xl px-4 py-3 text-sm font-semibold"
          style={{ color: "#fda4af", background: "rgba(225,29,106,0.1)", border: "1px solid rgba(225,29,106,0.25)" }}
        >
          {message}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
{sorted.map((m) => (
          <div
            key={m.id}
            className="rounded-xl px-6 py-5"
            style={{
              background: "#622569",
              border: "1px solid rgba(255,255,255,0.08)",
              opacity: m.status === "inactive" ? 0.6 : 1,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-bold text-white">{m.name}</p>
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest"
                    style={{
                      color: m.role === "admin" ? "#fb7aaa" : m.status === "inactive" ? "#94a3b8" : "#34d399",
                      background:
                        m.role === "admin"
                          ? "rgba(225,29,106,0.12)"
                          : m.status === "inactive"
                            ? "rgba(100,116,139,0.15)"
                            : "rgba(16,185,129,0.12)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {m.role === "admin" ? "Admin" : m.status === "inactive" ? "Inactive" : "Member"}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm font-semibold" style={{ color: "#94a3b8" }}>
                  {m.email}
                  {m.position ? ` · ${m.position}` : ""}
                </p>
                <p className="mt-0.5 text-[10px]" style={{ color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
                  {m.id}
                </p>
              </div>
              {m.id !== currentUser?.id && (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => setEditing(m)}
                    className="rounded-full p-2 transition-all duration-150"
                    style={{ color: "#64748b", background: "rgba(255,255,255,0.05)" }}
                    aria-label={`Edit ${m.name}`}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(168,85,247,0.15)"; e.currentTarget.style.color = "#c084fc"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#64748b"; }}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleting(m)}
                    className="rounded-full p-2 transition-all duration-150"
                    style={{ color: "#64748b", background: "rgba(255,255,255,0.05)" }}
                    aria-label={`Delete ${m.name}`}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(225,29,106,0.15)"; e.currentTarget.style.color = "#fb7aaa"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#64748b"; }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <MemberForm onClose={() => setShowCreate(false)} onSave={handleCreate} saving={saving} />
      )}
      {editing && (
        <MemberForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={(data) => handleUpdate(editing.id, data)}
          saving={saving}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Delete member?"
          message={`This removes the account for "${deleting.name}". Tasks they were assigned stay in the system.`}
          onCancel={() => setDeleting(null)}
          onConfirm={() => handleDelete(deleting.id)}
        />
      )}
    </div>
  );
}
/* ── Member create/edit modal ────────────────────────── */
function MemberForm({ initial, onClose, onSave, saving }) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState(
    initial
      ? {
          name: initial.name || "",
          email: initial.email || "",
          position: initial.position || "",
          role: initial.role || "member",
          status: initial.status || "active",
          password: "",
        }
      : {
          name: "",
          email: "",
          position: "",
          role: "member",
          status: "active",
          password: "",
        }
  );
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    if (!isEdit && form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (isEdit && form.password && form.password.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      position: form.position.trim(),
      role: form.role,
      status: form.status,
    };
    if (form.password) payload.newPassword = form.password;
    if (!isEdit) payload.password = form.password;
    onSave(payload);
  }

  return (
    <Modal title={isEdit ? "Edit member" : "Add member"} onClose={onClose} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="field-label" htmlFor="member-name">
              Full name
            </label>
            <input
              id="member-name"
              className="field-input"
              placeholder="Aditi Sharma"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label className="field-label" htmlFor="member-email">
              Email (used to log in)
            </label>
            <input
              id="member-email"
              type="email"
              className="field-input"
              placeholder="aditi@nexasoul.com"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="member-position">
            Position in club
          </label>
          <input
            id="member-position"
            className="field-input"
            placeholder="Event Head, Design Lead…"
            value={form.position}
            onChange={(e) => update("position", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="member-role">
              Account role
            </label>
            <select
              id="member-role"
              className="field-input"
              value={form.role}
              onChange={(e) => update("role", e.target.value)}
            >
              <option value="member">Executive Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="field-label" htmlFor="member-status">
              Status
            </label>
            <select
              id="member-status"
              className="field-input"
              value={form.status}
              onChange={(e) => update("status", e.target.value)}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive (blocks login)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="member-password">
            {isEdit ? "Set new password (leave blank to keep current)" : "Password (min 6 characters)"}
          </label>
          <input
            id="member-password"
            type="password"
            className="field-input"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </div>

        {error && (
          <p
            className="rounded-xl px-4 py-3 text-sm font-semibold"
            style={{ color: "#fda4af", background: "rgba(225,29,106,0.12)", border: "1px solid rgba(225,29,106,0.3)" }}
          >
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create member"}
          </button>
        </div>
      </form>
    </Modal>
  );
}