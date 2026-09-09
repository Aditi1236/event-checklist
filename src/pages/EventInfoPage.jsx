import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, CalendarDays, MapPin, Clock, Tag, Users,
  BookOpen, Star, Mic2, Handshake, Target, CheckCircle2,
  ExternalLink, Zap, Monitor, GraduationCap
} from "lucide-react";
import { useEvents } from "../context/EventsContext";
import { formatDate, eventTypeMeta } from "../utils/helpers";

/* ── tiny helpers ── */
function toLines(str = "") {
  return str
    .split(/\n|•/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function Badge({ children, color = "#4f46e5", bg }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest"
      style={{
        color,
        background: bg || `${color}12`,
        border: `1px solid ${color}28`,
        fontFamily: "'JetBrains Mono', monospace",
      }}
    >
      {children}
    </span>
  );
}

function InfoCard({ icon, label, value }) {
  if (!value) return null;
  return (
    <div
      className="flex flex-col gap-2 rounded-xl p-4"
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,23,42,0.08)",
        boxShadow: "0 1px 3px rgba(15,23,42,0.04)",
      }}
    >
      <div
        className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-semibold"
        style={{ color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}
      >
        {icon} {label}
      </div>
      <p className="text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function BulletPanel({ icon, title, color, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        background: "#ffffff",
        border: `1px solid ${color}20`,
        boxShadow: `0 0 40px -20px ${color}25`,
      }}
    >
      <h3
        className="flex items-center gap-2 text-base font-bold mb-4"
        style={{ color, fontFamily: "'Sora', sans-serif" }}
      >
        {icon} {title}
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3">
            <CheckCircle2 size={15} className="shrink-0 mt-0.5" style={{ color }} />
            <span className="text-sm font-medium leading-relaxed" style={{ color: "#475569" }}>
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PersonChips({ label, icon, raw, color }) {
  if (!raw) return null;
  const people = raw.split(",").map((s) => s.trim()).filter(Boolean);
  if (people.length === 0) return null;
  return (
    <div>
      <h4
        className="flex items-center gap-2 text-sm font-bold mb-3"
        style={{ color: "#475569", fontFamily: "'JetBrains Mono', monospace" }}
      >
        {icon} {label}
      </h4>
      <div className="flex flex-wrap gap-2">
        {people.map((p, i) => (
          <span
            key={i}
            className="rounded-full px-3 py-1.5 text-sm font-semibold"
            style={{
              background: `${color}10`,
              border: `1px solid ${color}25`,
              color: "#334155",
            }}
          >
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function EventInfoPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { getEvent } = useEvents();
  const event = getEvent(eventId);

  if (!event) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <div
          className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: "rgba(79,70,229,0.08)", border: "1px solid rgba(79,70,229,0.15)" }}
        >
          <CalendarDays size={28} style={{ color: "#4f46e5" }} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3" style={{ fontFamily: "'Sora', sans-serif" }}>
          Event not found
        </h1>
        <p className="text-sm mb-8" style={{ color: "#64748b" }}>
          This event may have been removed or the link is incorrect.
        </p>
        <Link to="/" className="btn-primary inline-flex">
          <ArrowLeft size={16} /> Back to Events
        </Link>
      </div>
    );
  }

  const type = eventTypeMeta(event.type || "event");
  const isBootcamp = event.type === "bootcamp";
  const outcomeLines = toLines(event.learningOutcomes);
  const benefitLines = toLines(event.studentBenefits);
  const highlightLines = toLines(event.highlights);

  const hasPeople = event.speakers || event.collaborators || event.teamMembers;

  return (
    <div className="relative">
      {/* Ambient orbs */}
      <div className="ambient-bg" style={{ opacity: 0.5 }}>
        <div className="orb orb-rose" style={{ width: 500, height: 500, opacity: 0.12 }} />
        <div className="orb orb-purple" style={{ width: 400, height: 400, opacity: 0.1 }} />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 pb-28 pt-8 sm:px-6">
        {/* Back link */}
        <button
          onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
          className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
          style={{ color: "#64748b", background: "transparent" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
        >
          <ArrowLeft size={15} /> Back
        </button>

        {/* ── Hero Card ── */}
        <div
          className="rounded-3xl overflow-hidden mb-8 animate-fadeIn"
          style={{
            background: "linear-gradient(135deg, #eef2ff 0%, #fdf4ff 100%)",
            border: "1px solid rgba(79,70,229,0.15)",
            boxShadow: `0 8px 60px -12px ${type.color}30, 0 2px 4px rgba(15,23,42,0.06)`,
          }}
        >
          {/* Top accent stripe */}
          <div
            className="h-1 w-full"
            style={{
              background: `linear-gradient(90deg, ${type.color}, ${isBootcamp ? "#6366f1" : "#f43f5e"})`,
            }}
          />

          <div className="p-8 sm:p-10">
            {/* Type + category badges */}
            <div className="flex flex-wrap items-center gap-2 mb-5">
              <Badge color={type.color}>{type.label}</Badge>
              {event.category && <Badge color="#b45309">{event.category}</Badge>}
              {event.mode && isBootcamp && (
                <Badge color="#0ea5e9">{event.mode}</Badge>
              )}
            </div>

            {/* Title */}
            <h1
              className="text-3xl font-black leading-tight mb-6 sm:text-5xl"
              style={{ fontFamily: "'Sora', sans-serif", color: "#1e1b4b" }}
            >
              {event.name}
            </h1>

            {/* Meta row */}
            <div className="flex flex-wrap gap-4 mb-6">
              {event.date && (
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#475569" }}>
                  <CalendarDays size={15} style={{ color: type.color }} />
                  {formatDate(event.date)}
                  {event.endDate ? ` → ${formatDate(event.endDate)}` : ""}
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#475569" }}>
                  <MapPin size={15} style={{ color: "#4f46e5" }} />
                  {event.location}
                </div>
              )}
              {event.duration && (
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "#475569" }}>
                  <Clock size={15} style={{ color: "#059669" }} />
                  {event.duration}
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <p
                className="text-base font-medium leading-relaxed max-w-2xl"
                style={{ color: "#475569" }}
              >
                {event.description}
              </p>
            )}

            {/* Register CTA */}
            {event.registrationLink && (
              <div className="mt-8">
                <a
                  href={event.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-accent inline-flex items-center gap-2 !px-6 !py-3 text-base font-bold"
                >
                  Register Now <ExternalLink size={16} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ── Key Info Grid ── */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <InfoCard icon={<Clock size={12} />} label="Duration" value={event.duration} />

          <InfoCard
            icon={<Monitor size={12} />}
            label="Mode"
            value={event.mode || null}
          />
        </div>

        {/* ── Body sections ── */}
        <div className="space-y-6">

          {/* Learning Outcomes + Student Benefits */}
          {(outcomeLines.length > 0 || benefitLines.length > 0) && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <BulletPanel
                icon={<GraduationCap size={16} />}
                title="Learning Outcomes"
                color="#7c3aed"
                items={outcomeLines}
              />
              <BulletPanel
                icon={<Star size={16} />}
                title="Student Benefits"
                color="#b45309"
                items={benefitLines}
              />
            </div>
          )}

          {/* Highlights */}
          {highlightLines.length > 0 && (
            <BulletPanel
              icon={<Zap size={16} />}
              title="Event Highlights"
              color="#059669"
              items={highlightLines}
            />
          )}

          {/* Target Audience & Prerequisites */}
          {(event.targetAudience || event.prerequisites) && (
            <div
              className="rounded-2xl p-6 grid grid-cols-1 gap-5 sm:grid-cols-2"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(15,23,42,0.08)",
              }}
            >
              {event.targetAudience && (
                <div>
                  <h3
                    className="flex items-center gap-2 text-sm font-bold mb-2"
                    style={{ color: "#059669", fontFamily: "'Sora', sans-serif" }}
                  >
                    <Target size={15} /> Target Audience
                  </h3>
                  <p className="text-sm font-medium" style={{ color: "#475569" }}>
                    {event.targetAudience}
                  </p>
                </div>
              )}
              {event.prerequisites && (
                <div>
                  <h3
                    className="flex items-center gap-2 text-sm font-bold mb-2"
                    style={{ color: "#e11d6a", fontFamily: "'Sora', sans-serif" }}
                  >
                    <BookOpen size={15} /> Prerequisites
                  </h3>
                  <p className="text-sm font-medium" style={{ color: "#475569" }}>
                    {event.prerequisites}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tech Stack */}
          {event.techStack && (
            <div
              className="rounded-2xl p-6"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(15,23,42,0.08)",
              }}
            >
              <h3
                className="flex items-center gap-2 text-sm font-bold mb-4"
                style={{ color: "#6366f1", fontFamily: "'Sora', sans-serif" }}
              >
                <Tag size={15} /> Tech Stack
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.techStack.split(",").map((t, i) => (
                  <span
                    key={i}
                    className="rounded-lg px-3 py-1.5 text-xs font-bold"
                    style={{
                      background: "rgba(99,102,241,0.08)",
                      border: "1px solid rgba(99,102,241,0.2)",
                      color: "#4f46e5",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {t.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* People */}
          {hasPeople && (
            <div
              className="rounded-2xl p-6 space-y-6"
              style={{
                background: "#ffffff",
                border: "1px solid rgba(15,23,42,0.08)",
              }}
            >
              <h2
                className="text-base font-bold text-slate-900"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                People
              </h2>
              <PersonChips
                label="Speakers / Instructors"
                icon={<Mic2 size={13} />}
                raw={event.speakers}
                color="#7c3aed"
              />
              <PersonChips
                label="Collaborators / Partners"
                icon={<Handshake size={13} />}
                raw={event.collaborators}
                color="#b45309"
              />
              <PersonChips
                label="Organizing Team"
                icon={<Users size={13} />}
                raw={event.teamMembers}
                color="#059669"
              />
            </div>
          )}

          {/* Extra: registrations count */}
          {!isBootcamp && event.registrations > 0 && (
            <div
              className="rounded-2xl px-6 py-4 flex items-center gap-4"
              style={{
                background: "rgba(225,29,106,0.05)",
                border: "1px solid rgba(225,29,106,0.15)",
              }}
            >
              <Users size={20} style={{ color: "#e11d6a" }} />
              <div>
                <p className="text-xs uppercase tracking-widest font-bold" style={{ color: "#e11d6a", fontFamily: "'JetBrains Mono', monospace" }}>
                  Registrations
                </p>
                <p className="text-2xl font-black text-slate-900" style={{ fontFamily: "'Sora', sans-serif" }}>
                  {event.registrations}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Bottom CTA ── */}
        {event.registrationLink && (
          <div
            className="mt-10 rounded-2xl p-8 text-center"
            style={{
              background: `linear-gradient(135deg, ${type.color}10, transparent)`,
              border: `1px solid ${type.color}25`,
            }}
          >
            <h3 className="text-xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
              Ready to join?
            </h3>
            <p className="text-sm mb-6" style={{ color: "#64748b" }}>
              Secure your spot — registrations are limited.
            </p>
            <a
              href={event.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-accent inline-flex items-center gap-2 !px-8 !py-3 text-base font-bold"
            >
              Register Now <ExternalLink size={16} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}