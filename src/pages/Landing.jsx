import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  UserCheck,
  ClipboardCheck,
  ListChecks,
  CalendarDays,
  Users,
  BarChart3,
  Zap,
  Radio,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  MapPin,
  Tag,
  TrendingUp,
  Lock,
} from "lucide-react";
import { useEvents } from "../context/EventsContext";
import { useAuth } from "../context/AuthContext";
import { formatDateShort, progressOf, eventTypeMeta, daysUntil } from "../utils/helpers";

const FEATURES = [
  {
    icon: ClipboardCheck,
    title: "Event Planning",
    text: "Create events and bootcamps with dates, venues, budgets, speakers and learning outcomes in one place.",
    color: "#4f46e5",
  },
  {
    icon: ListChecks,
    title: "Smart Checklists",
    text: "Every task is grouped into Before, During and After the event, with priority and due dates.",
    color: "#7c3aed",
  },
  {
    icon: Users,
    title: "Task Assignment",
    text: "Assign owners to each task and see exactly who is carrying what across the committee.",
    color: "#e11d6a",
  },
  {
    icon: BarChart3,
    title: "Live Progress",
    text: "Watch completion climb in real time with per-event progress rings and an overall health metric.",
    color: "#059669",
  },
  {
    icon: Radio,
    title: "Instant Sync",
    text: "Changes broadcast to every device the second they happen — no refresh, no stale checklists.",
    color: "#0ea5e9",
  },
  {
    icon: Lock,
    title: "Role Based Access",
    text: "Admins run the show, members only see and update their own tasks. Access stays protected.",
    color: "#f59e0b",
  },
];

const PORTALS = [
  {
    icon: ShieldCheck,
    title: "Admin Portal",
    tagline: "Full control",
    to: "/admin/login",
    color: "#4f46e5",
    gradient: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
    points: [
      "Create, edit and archive events",
      "Build checklists and assign owners",
      "Review every member's workload",
      "Overall progress and analytics",
    ],
  },
  {
    icon: UserCheck,
    title: "Member Portal",
    tagline: "Executive members",
    to: "/login",
    color: "#059669",
    gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    points: [
      "See only the tasks assigned to you",
      "Move tasks from pending to done",
      "Track due dates and deadlines",
      "Zero access to admin controls",
    ],
  },
];

const STEPS = [
  {
    step: "01",
    icon: CalendarDays,
    title: "Admins create the event",
    text: "Set the date, location, mode and full event brief. Add the checklist that keeps the team aligned.",
  },
  {
    step: "02",
    icon: Users,
    title: "Tasks go to owners",
    text: "Every item is assigned to a member with a priority and due date, so nobody is left guessing.",
  },
  {
    step: "03",
    icon: TrendingUp,
    title: "Progress updates live",
    text: "Members tick off their work and the progress ring fills in real time for the whole committee.",
  },
];

const SECTION_LABEL = {
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  fontFamily: "'JetBrains Mono', monospace",
};

function Eyebrow({ children, color = "#4f46e5" }) {
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold"
      style={{
        ...SECTION_LABEL,
        color,
        background: `${color}0f`,
        border: `1px solid ${color}26`,
      }}
    >
      {children}
    </span>
  );
}

function SectionHeading({ eyebrow, title, subtitle, color = "#4f46e5", center = true }) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <Eyebrow color={color}>{eyebrow}</Eyebrow>
      <h2
        className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl"
        style={{ fontFamily: "'Sora', sans-serif", color: "#0f172a" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 text-base font-medium leading-relaxed" style={{ color: "#64748b" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function ChecklistPreview() {
  const groups = [
    {
      label: "Before Event",
      color: "#4f46e5",
      items: [
        { text: "Book venue & confirm speakers", done: true },
        { text: "Publish registration link", done: true },
        { text: "Print badges & kit", done: true },
      ],
    },
    {
      label: "During Event",
      color: "#f59e0b",
      items: [
        { text: "Set up registration desk", done: true },
        { text: "Run the opening session", done: false },
      ],
    },
    {
      label: "After Event",
      color: "#059669",
      items: [{ text: "Collect feedback & report", done: false }],
    },
  ];

  return (
    <div
      className="relative w-full max-w-md animate-fadeIn"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,23,42,0.08)",
        borderRadius: 24,
        boxShadow: "0 32px 80px -24px rgba(15,23,42,0.28)",
      }}
    >
      <div
        className="h-1 w-full rounded-t-[24px]"
        style={{ background: "linear-gradient(90deg, #4f46e5, #7c3aed, #10b981)" }}
      />
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className="text-[10px] font-bold"
              style={{ ...SECTION_LABEL, color: "#e11d6a" }}
            >
              Bootcamp
            </p>
            <h3
              className="mt-1 text-xl font-extrabold"
              style={{ fontFamily: "'Sora', sans-serif", color: "#0f172a" }}
            >
              Code Sprint 2026
            </h3>
            <p
              className="mt-1.5 text-xs font-semibold"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}
            >
              4/6 complete
            </p>
          </div>
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
            style={{
              background: "conic-gradient(#7c3aed 0turn 0.67turn, rgba(29,23,51,0.1) 0.67turn 1turn)",
            }}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
              <span
                className="text-xs font-extrabold"
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "#7c3aed" }}
              >
                67%
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 h-1.5 w-full overflow-hidden rounded-full" style={{ background: "rgba(15,23,42,0.07)" }}>
          <div
            className="h-full rounded-full"
            style={{ width: "67%", background: "linear-gradient(90deg, #4f46e5, #7c3aed)" }}
          />
        </div>

        <div className="mt-5 space-y-4">
          {groups.map((group) => (
            <div key={group.label}>
              <p
                className="mb-2 text-[10px] font-bold"
                style={{ ...SECTION_LABEL, color: group.color }}
              >
                {group.label}
              </p>
              <div className="space-y-1.5">
                {group.items.map((item) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2"
                    style={{ background: "#f8fafc", border: "1px solid rgba(15,23,42,0.05)" }}
                  >
                    {item.done ? (
                      <CheckCircle2 size={15} style={{ color: "#10b981" }} className="shrink-0" />
                    ) : (
                      <Circle size={15} style={{ color: "#cbd5e1" }} className="shrink-0" />
                    )}
                    <span
                      className="text-sm font-semibold"
                      style={{
                        color: item.done ? "#64748b" : "#334155",
                        textDecoration: item.done ? "line-through" : "none",
                      }}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-5 flex items-center gap-2.5 rounded-xl px-3.5 py-3"
          style={{ background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)" }}
        >
          <Zap size={15} style={{ color: "#059669" }} className="shrink-0" />
          <p className="text-xs font-bold" style={{ color: "#047857" }}>
            Synced live across every member&apos;s device
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div
      className="flex items-center gap-4 rounded-2xl px-5 py-4"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,23,42,0.07)",
        boxShadow: "0 1px 3px rgba(15,23,42,0.05)",
      }}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
        style={{ background: `${color}12`, border: `1px solid ${color}22`, color }}
      >
        <Icon size={19} />
      </span>
      <div className="min-w-0">
        <p
          className="text-2xl font-extrabold leading-none"
          style={{ fontFamily: "'Sora', sans-serif", color: "#0f172a" }}
        >
          {value}
        </p>
        <p
          className="mt-1 text-[11px] font-bold"
          style={{ ...SECTION_LABEL, color: "#94a3b8" }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

export default function Landing() {
  const { events, loaded } = useEvents();
  const { user, isAdmin } = useAuth();

  const stats = useMemo(() => {
    const list = Array.isArray(events) ? events : [];
    let total = 0;
    let done = 0;
    for (const evt of list) {
      for (const task of evt.tasks ?? []) {
        total += 1;
        if (task.completed || task.status === "completed") done += 1;
      }
    }
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    return { events: list.length, tasks: total, done, pct };
  }, [events]);

  const upcoming = useMemo(() => {
    const list = Array.isArray(events) ? [...events] : [];
    return list
      .filter((e) => e.date)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .filter((e) => {
        const remaining = daysUntil(e.date);
        return remaining !== null && remaining >= 0;
      })
      .slice(0, 3);
  }, [events]);

  const portalHref = isAdmin ? "/admin" : "/me";
  const portalLabel = isAdmin ? "Go to Admin Dashboard" : "Go to My Tasks";

  return (
    <div className="relative overflow-hidden">
      <div className="ambient-bg">
        <div className="orb orb-rose" />
        <div className="orb orb-purple" />
        <div className="orb orb-emerald" />
      </div>

      <div className="relative z-10">
        {/* ── Hero ─────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <div className="animate-fadeIn">
              <Eyebrow color="#4f46e5">
                <Sparkles size={12} /> NexaSoul · Chandigarh University
              </Eyebrow>

              <h1
                className="mt-6 text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl"
                style={{ fontFamily: "'Sora', sans-serif", color: "#0f172a" }}
              >
                Every club event,{" "}
                <span className="text-shimmer">planned and proven.</span>
              </h1>

              <p
                className="mt-5 max-w-xl text-base font-medium leading-relaxed sm:text-lg"
                style={{ color: "#475569" }}
              >
                Roster is the command centre for event checklists. Admins plan the run of
                show, assign every task to a member, and watch progress climb live — no
                spreadsheets, no chasing people for status updates.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                {user ? (
                  <>
                    <Link
                      to={portalHref}
                      className="btn-accent !px-7 !py-3.5 text-base font-bold"
                    >
                      {portalLabel} <ArrowRight size={17} />
                    </Link>
                    <span
                      className="rounded-full px-5 py-3.5 text-sm font-bold"
                      style={{
                        color: isAdmin ? "#4f46e5" : "#059669",
                        background: isAdmin ? "rgba(79,70,229,0.07)" : "rgba(5,150,105,0.07)",
                        border: `1px solid ${isAdmin ? "rgba(79,70,229,0.2)" : "rgba(5,150,105,0.2)"}`,
                      }}
                    >
                      Signed in as {user.name.split(" ")[0]}
                    </span>
                  </>
                ) : (
                  <>
                    <Link
                      to="/admin/login"
                      className="btn-accent !px-7 !py-3.5 text-base font-bold"
                    >
                      <ShieldCheck size={18} /> Admin Login
                    </Link>
                    <Link
                      to="/login"
                      className="btn-secondary !px-7 !py-3.5 text-base font-bold"
                    >
                      <UserCheck size={18} /> Member Login
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2.5">
                {[
                  "Authorized admins only",
                  "Role-based access",
                  "Live task sync",
                ].map((item) => (
                  <span
                    key={item}
                    className="flex items-center gap-1.5 text-xs font-bold"
                    style={{ color: "#64748b" }}
                  >
                    <CheckCircle2 size={14} style={{ color: "#10b981" }} />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex justify-center lg:justify-end">
              <ChecklistPreview />
            </div>
          </div>
        </section>

        {/* ── Live stats ───────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            <StatCard
              icon={CalendarDays}
              value={loaded ? stats.events : "—"}
              label="Events Tracked"
              color="#4f46e5"
            />
            <StatCard
              icon={ListChecks}
              value={loaded ? stats.tasks : "—"}
              label="Tasks Managed"
              color="#7c3aed"
            />
            <StatCard
              icon={CheckCircle2}
              value={loaded ? stats.done : "—"}
              label="Tasks Completed"
              color="#059669"
            />
            <StatCard
              icon={TrendingUp}
              value={loaded ? `${stats.pct}%` : "—"}
              label="Overall Progress"
              color="#e11d6a"
            />
          </div>
        </section>

        {/* ── Features ─────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <SectionHeading
            eyebrow="Why Roster"
            title="Everything your committee needs to run a flawless event"
            subtitle="Built for student organising teams — plan the event, divide the work, and see exactly where the team stands without asking a single person for an update."
          />

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="card-glass group relative overflow-hidden p-6"
              >
                <span
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, ${feature.color}1f, ${feature.color}0a)`,
                    border: `1px solid ${feature.color}2a`,
                    color: feature.color,
                  }}
                >
                  <feature.icon size={21} />
                </span>
                <h3
                  className="text-lg font-bold"
                  style={{ fontFamily: "'Sora', sans-serif", color: "#0f172a" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="mt-2.5 text-sm font-medium leading-relaxed"
                  style={{ color: "#64748b" }}
                >
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Portals ──────────────────────────────── */}
        <section
          className="border-y py-20 sm:py-24"
          style={{
            background: "linear-gradient(180deg, #ffffff 0%, #f8f9ff 100%)",
            borderColor: "rgba(15,23,42,0.06)",
          }}
        >
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <SectionHeading
              eyebrow="Choose your portal"
              title="Two ways in — pick the one that fits your role"
              subtitle="Admins orchestrate the entire event. Executive members simply get their own tasks and update them as the work happens."
            />

            <div className="mt-14 grid grid-cols-1 gap-5 lg:grid-cols-2">
              {PORTALS.map((portal) => (
                <div
                  key={portal.title}
                  className="group relative flex flex-col overflow-hidden rounded-3xl p-7 transition-all duration-300 sm:p-8"
                  style={{
                    background: "#ffffff",
                    border: `1px solid ${portal.color}1f`,
                    boxShadow: `0 12px 40px -20px ${portal.color}45`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = `0 24px 60px -20px ${portal.color}55`;
                    e.currentTarget.style.borderColor = `${portal.color}45`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = `0 12px 40px -20px ${portal.color}45`;
                    e.currentTarget.style.borderColor = `${portal.color}1f`;
                  }}
                >
                  <div
                    className="h-1 w-full"
                    style={{ background: portal.gradient }}
                  />

                  <div className="flex items-center gap-4 pt-6">
                    <span
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: portal.gradient,
                        boxShadow: `0 4px 18px ${portal.color}45`,
                      }}
                    >
                      <portal.icon size={24} />
                    </span>
                    <div>
                      <h3
                        className="text-2xl font-extrabold"
                        style={{ fontFamily: "'Sora', sans-serif", color: "#0f172a" }}
                      >
                        {portal.title}
                      </h3>
                      <p
                        className="text-[11px] font-bold"
                        style={{ ...SECTION_LABEL, color: portal.color }}
                      >
                        {portal.tagline}
                      </p>
                    </div>
                  </div>

                  <ul className="mt-6 flex-1 space-y-3">
                    {portal.points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 shrink-0"
                          style={{ color: portal.color }}
                        />
                        <span
                          className="text-sm font-semibold leading-relaxed"
                          style={{ color: "#475569" }}
                        >
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={portal.to}
                    className="mt-7 flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-white transition-all duration-200"
                    style={{
                      background: portal.gradient,
                      boxShadow: `0 4px 20px ${portal.color}40`,
                    }}
                  >
                    Continue to {portal.title} <ArrowRight size={16} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <SectionHeading
            eyebrow="How it works"
            title="From idea to wrapped-up event in three steps"
          />

          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
            {STEPS.map((item) => (
              <div
                key={item.step}
                className="card-glass relative p-7"
              >
                <span
                  className="absolute right-6 top-5 text-5xl font-extrabold"
                  style={{
                    fontFamily: "'Sora', sans-serif",
                    color: "rgba(79,70,229,0.08)",
                  }}
                >
                  {item.step}
                </span>
                <span
                  className="flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{
                    background: "linear-gradient(135deg, rgba(79,70,229,0.12), rgba(124,58,237,0.06))",
                    border: "1px solid rgba(79,70,229,0.2)",
                    color: "#4f46e5",
                  }}
                >
                  <item.icon size={21} />
                </span>
                <h3
                  className="mt-4 text-lg font-bold"
                  style={{ fontFamily: "'Sora', sans-serif", color: "#0f172a" }}
                >
                  {item.title}
                </h3>
                <p
                  className="mt-2.5 text-sm font-medium leading-relaxed"
                  style={{ color: "#64748b" }}
                >
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Upcoming events ──────────────────────── */}
        {loaded && upcoming.length > 0 && (
          <section
            className="border-t py-20 sm:py-24"
            style={{ background: "#ffffff", borderColor: "rgba(15,23,42,0.06)" }}
          >
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
              <SectionHeading
                eyebrow="On the horizon"
                title="What's coming up next"
                subtitle="Public event briefs are open to everyone — sign in only when you need to work on the checklist."
                color="#059669"
              />

              <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
                {upcoming.map((event) => {
                  const type = eventTypeMeta(event.type || "event");
                  const { done, total, pct } = progressOf(event);
                  return (
                    <Link
                      key={event.id}
                      to={`/events/${event.id}`}
                      className="group flex flex-col overflow-hidden rounded-2xl transition-all duration-300"
                      style={{
                        background: "#ffffff",
                        border: "1px solid rgba(15,23,42,0.08)",
                        boxShadow: "0 1px 3px rgba(15,23,42,0.05)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-3px)";
                        e.currentTarget.style.borderColor = `${type.color}45`;
                        e.currentTarget.style.boxShadow = `0 16px 44px -18px ${type.color}45`;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.borderColor = "rgba(15,23,42,0.08)";
                        e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.05)";
                      }}
                    >
                      <div
                        className="h-1 w-full"
                        style={{ background: `linear-gradient(90deg, ${type.color}, ${type.color}99)` }}
                      />
                      <div className="flex flex-1 flex-col p-6">
                        <div className="flex items-center gap-2">
                          <span
                            className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest text-white"
                            style={{ background: type.color, fontFamily: "'JetBrains Mono', monospace" }}
                          >
                            {type.label}
                          </span>
                          {event.category && (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                              style={{ color: "#0891b2" }}
                            >
                              <Tag size={10} /> {event.category}
                            </span>
                          )}
                        </div>

                        <h3
                          className="mt-3 text-lg font-extrabold leading-snug"
                          style={{ fontFamily: "'Sora', sans-serif", color: "#0f172a" }}
                        >
                          {event.name}
                        </h3>

                        <div className="mt-3 space-y-1.5">
                          <div className="flex items-center gap-2">
                            <CalendarDays size={14} style={{ color: "#64748b" }} />
                            <span
                              className="text-sm font-bold"
                              style={{ fontFamily: "'JetBrains Mono', monospace", color: "#334155" }}
                            >
                              {formatDateShort(event.date)}
                            </span>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-2">
                              <MapPin size={14} style={{ color: "#64748b" }} />
                              <span className="text-sm font-semibold" style={{ color: "#475569" }}>
                                {event.location}
                              </span>
                            </div>
                          )}
                          {event.duration && (
                            <div className="flex items-center gap-2">
                              <Clock size={14} style={{ color: "#64748b" }} />
                              <span className="text-sm font-semibold" style={{ color: "#475569" }}>
                                {event.duration}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-auto pt-5">
                          <div
                            className="h-1.5 w-full overflow-hidden rounded-full"
                            style={{ background: "rgba(15,23,42,0.07)" }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${pct}%`,
                                background:
                                  pct === 100
                                    ? "linear-gradient(90deg, #10b981, #34d399)"
                                    : `linear-gradient(90deg, ${type.color}, ${type.color}cc)`,
                              }}
                            />
                          </div>
                          <p
                            className="mt-2 text-xs font-bold"
                            style={{ fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}
                          >
                            {total === 0 ? "Checklist coming soon" : `${done}/${total} tasks done`}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Final CTA ────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
          <div
            className="relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-14"
            style={{
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #a855f7 100%)",
              boxShadow: "0 30px 80px -28px rgba(79,70,229,0.7)",
            }}
          >
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full"
              style={{ background: "rgba(255,255,255,0.12)", filter: "blur(60px)" }}
            />
            <div
              className="pointer-events-none absolute -bottom-20 -left-10 h-64 w-64 rounded-full"
              style={{ background: "rgba(16,185,129,0.22)", filter: "blur(60px)" }}
            />

            <div className="relative">
              <h2
                className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight text-white sm:text-4xl"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {user
                  ? "Your checklist is waiting. Pick up where you left off."
                  : "Ready to run your next event like clockwork?"}
              </h2>
              <p
                className="mx-auto mt-4 max-w-xl text-base font-medium leading-relaxed"
                style={{ color: "rgba(255,255,255,0.85)" }}
              >
                {user
                  ? "Head back to your dashboard and keep the progress moving."
                  : "Sign in with your portal to manage events, assign tasks and track your committee's progress in real time."}
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {user ? (
                  <Link
                    to={portalHref}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-bold transition-all duration-200 hover:-translate-y-0.5"
                    style={{ color: "#4338ca", boxShadow: "0 10px 30px rgba(15,23,42,0.25)" }}
                  >
                    {portalLabel} <ArrowRight size={17} />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/admin/login"
                      className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-base font-bold transition-all duration-200 hover:-translate-y-0.5"
                      style={{ color: "#4338ca", boxShadow: "0 10px 30px rgba(15,23,42,0.25)" }}
                    >
                      <ShieldCheck size={18} /> Admin Login
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-bold transition-all duration-200"
                      style={{
                        color: "#ffffff",
                        background: "rgba(255,255,255,0.14)",
                        border: "1px solid rgba(255,255,255,0.35)",
                      }}
                    >
                      <UserCheck size={18} /> Member Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
