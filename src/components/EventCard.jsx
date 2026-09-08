import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Pencil, Trash2, ArrowRight, Clock, Users, Monitor, Award, BookOpen, Target, Star, Link as LinkIcon, Zap, GraduationCap, UserCheck, Handshake, Wallet, Tag } from "lucide-react";
import ProgressStamp from "./ProgressStamp";
import { formatDateShort, progressOf, daysUntil, eventTypeMeta } from "../utils/helpers";

function getDayTagStyle(remaining) {
  if (remaining === null) return null;
  if (remaining === 0) return { label: "Today", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)", color: "#b45309" };
  if (remaining > 0 && remaining <= 7) return { label: `In ${remaining}d`, bg: "rgba(79,70,229,0.08)", border: "rgba(79,70,229,0.2)", color: "#4f46e5" };
  if (remaining > 0) return { label: `In ${remaining}d`, bg: "rgba(16,185,129,0.08)", border: "rgba(16,185,129,0.2)", color: "#059669" };
  return { label: "Past", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.18)", color: "#64748b" };
}

function DetailItem({ icon: Icon, label, value, isLink = false, color = "#64748b" }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon size={14} className="shrink-0 mt-0.5" style={{ color }} />
      <div className="min-w-0 flex-1">
        <span className="font-semibold" style={{ color: "#64748b" }}>{label}: </span>
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all hover:underline"
            style={{ color: "#4f46e5" }}
            onClick={(e) => e.stopPropagation()}
          >
            {value}
          </a>
        ) : (
          <span style={{ color: "#334155" }}>{value}</span>
        )}
      </div>
    </div>
  );
}

function MultiLines({ value }) {
  if (!value) return null;
  const lines = String(value).split(/\n|•/).map((s) => s.trim()).filter(Boolean);
  if (lines.length === 0) return null;
  return (
    <ul className="space-y-1.5">
      {lines.map((line, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: "#94a3b8" }} />
          <span style={{ color: "#334155" }}>{line}</span>
        </li>
      ))}
    </ul>
  );
}

function Section({ icon: Icon, title, color = "#64748b", children }) {
  return (
    <div className="border-t pt-3" style={{ borderColor: "rgba(0,0,0,0.06)" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <Icon size={13} style={{ color }} />
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
          {title}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function TagList({ items, color = "#6366f1" }) {
  if (!items) return null;
  const itemList = typeof items === "string" ? items.split(",").map(i => i.trim()).filter(Boolean) : items;
  if (itemList.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {itemList.map((item, idx) => (
        <span
          key={idx}
          className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
          style={{
            color: color,
            background: `${color}10`,
            border: `1px solid ${color}25`,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function EventCard({ event, onEdit, onDelete, onSelect, canManage = true }) {
  const { done, total, pct } = progressOf(event);
  const remaining = daysUntil(event.date);
  const dayTag = getDayTagStyle(remaining);
  const type = eventTypeMeta(event.type || "event");
  const isBootcamp = event.type === "bootcamp";

  const eyebrowColors = {
    event: "#4f46e5",
    bootcamp: "#7c3aed",
    hackathon: "#e11d6a",
    workshop: "#10b981",
    competition: "#f59e0b",
    "awareness session": "#0ea5e9",
  };

  return (
    <div
      className={`group relative rounded-2xl flex flex-col transition-all duration-300 animate-fadeIn overflow-hidden ${onSelect ? "cursor-pointer" : ""}`}
      style={{
        background: "#ffffff",
        border: "1px solid rgba(15,23,42,0.08)",
        minHeight: 300,
        boxShadow: "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.05)",
      }}
      onClick={onSelect ? () => onSelect(event) : undefined}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(79,70,229,0.3)";
        e.currentTarget.style.boxShadow = "0 0 0 1px rgba(79,70,229,0.15), 0 8px 40px -8px rgba(79,70,229,0.12), 0 2px 4px rgba(15,23,42,0.06)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(15,23,42,0.08)";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(15,23,42,0.06), 0 4px 16px rgba(15,23,42,0.05)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Accent top stripe */}
      <div
        className="h-1 w-full"
        style={{
          background: pct === 100
            ? "linear-gradient(90deg, #10b981, #34d399)"
            : `linear-gradient(90deg, ${type.color}, ${type.color}99)`,
        }}
      />

      {/* Card body */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <span
                className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest"
                style={{
                  color: "#ffffff",
                  background: `linear-gradient(135deg, ${type.color}, ${type.color}cc)`,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {type.label}
              </span>
              {event.category && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    color: (eyebrowColors[event.category.toLowerCase()] || "#0891b2"),
                    background: `${(eyebrowColors[event.category.toLowerCase()] || "#0891b2")}10`,
                    border: `1px solid ${(eyebrowColors[event.category.toLowerCase()] || "#0891b2")}25`,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  <Tag size={9} />
                  {event.category}
                </span>
              )}
            </div>
            {onSelect ? (
              <h3
                className="text-2xl font-black leading-snug transition-colors duration-200 group-hover:text-indigo-700"
                style={{ fontFamily: "'Sora', sans-serif", color: "#0f172a" }}
              >
                {event.name}
              </h3>
            ) : (
              <Link to={`/events/${event.id}`} onClick={(e) => e.stopPropagation()}>
                <h3
                  className="text-2xl font-black leading-snug transition-colors duration-200 group-hover:text-indigo-700"
                  style={{ fontFamily: "'Sora', sans-serif", color: "#0f172a" }}
                >
                  {event.name}
                </h3>
              </Link>
            )}
          </div>
          <ProgressStamp pct={pct} size="sm" />
        </div>

        {/* Meta */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <CalendarDays size={14} style={{ color: "#64748b" }} />
            <span
              className="text-sm font-bold"
              style={{ color: "#1e293b", fontFamily: "'JetBrains Mono', monospace" }}
            >
              {formatDateShort(event.date)}
              {event.endDate && ` - ${formatDateShort(event.endDate)}`}
            </span>
            {event.duration && (
              <>
                <span style={{ color: "#cbd5e1" }}>•</span>
                <Clock size={14} style={{ color: "#64748b" }} />
                <span className="text-sm font-semibold" style={{ color: "#334155" }}>
                  {event.duration}
                </span>
              </>
            )}
            {dayTag && (
              <span
                className="rounded-full px-2 py-0.5 text-xs font-bold"
                style={{
                  color: dayTag.color,
                  background: dayTag.bg,
                  border: `1px solid ${dayTag.border}`,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {dayTag.label}
              </span>
            )}
          </div>
          {event.location && (
            <div className="flex items-center gap-1.5">
              <MapPin size={14} style={{ color: "#64748b" }} />
              <span className="text-sm font-semibold" style={{ color: "#064e3b" }}>
                {event.location}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 flex-wrap text-sm font-semibold" style={{ color: "#475569" }}>
            <Monitor size={14} style={{ color: "#64748b" }} />
            <span className="uppercase tracking-wider">{event.mode || "offline"}</span>
          </div>
        </div>

        {event.description && (
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "#475569" }}>
            {event.description}
          </p>
        )}

        {/* All details */}
        <div className="mt-4 space-y-3">
          {/* Capacity, Registrations & Budget (events) */}
          {!isBootcamp && (event.capacity || event.registrations || event.budget) && (
            <div className="grid grid-cols-2 gap-2">
              {event.capacity && (
                <DetailItem icon={Users} label="Capacity" value={`${event.capacity} seats`} />
              )}
              {event.registrations && (
                <DetailItem icon={UserCheck} label="Registrations" value={event.registrations} />
              )}
              {event.budget && (
                <DetailItem icon={Wallet} label="Budget" value={`₹${Number(event.budget).toLocaleString("en-IN")}`} />
              )}
            </div>
          )}

          {/* Bootcamp budget */}
          {isBootcamp && event.budget && (
            <DetailItem icon={Wallet} label="Budget" value={`₹${Number(event.budget).toLocaleString("en-IN")}`} />
          )}

          {/* Tech Stack */}
          {event.techStack && (
            <Section icon={Zap} title="Tech Stack" color="#6366f1">
              <TagList items={event.techStack} color="#6366f1" />
            </Section>
          )}

          {/* Speakers */}
          {event.speakers && (
            <Section icon={Award} title="Speakers / Instructors" color="#8b5cf6">
              <TagList items={event.speakers} color="#8b5cf6" />
            </Section>
          )}

          {/* Team Members */}
          {event.teamMembers && (
            <Section icon={Users} title="Team Members" color="#ec4899">
              <TagList items={event.teamMembers} color="#ec4899" />
            </Section>
          )}

          {/* Collaborators */}
          {event.collaborators && (
            <Section icon={Handshake} title="Collaborators" color="#10b981">
              <TagList items={event.collaborators} color="#10b981" />
            </Section>
          )}

          {/* Duration (bootcamp) */}
          {isBootcamp && event.duration && (
            <Section icon={Clock} title="Duration" color="#0ea5e9">
              <p className="text-sm" style={{ color: "#334155" }}>{event.duration}</p>
            </Section>
          )}

          {/* Target Audience */}
          {event.targetAudience && (
            <Section icon={Target} title="Target Audience" color="#f59e0b">
              <p className="text-sm" style={{ color: "#334155" }}>{event.targetAudience}</p>
            </Section>
          )}

          {/* Prerequisites */}
          {event.prerequisites && (
            <Section icon={BookOpen} title="Prerequisites" color="#e11d6a">
              <p className="text-sm" style={{ color: "#334155" }}>{event.prerequisites}</p>
            </Section>
          )}

          {/* Learning Outcomes */}
          {event.learningOutcomes && (
            <Section icon={GraduationCap} title="Learning Outcomes" color="#8b5cf6">
              <MultiLines value={event.learningOutcomes} />
            </Section>
          )}

          {/* Student Benefits */}
          {event.studentBenefits && (
            <Section icon={Star} title="Student Benefits" color="#f59e0b">
              <MultiLines value={event.studentBenefits} />
            </Section>
          )}

          {/* Highlights */}
          {event.highlights && (
            <Section icon={Zap} title="Highlights" color="#10b981">
              <MultiLines value={event.highlights} />
            </Section>
          )}

          {/* Registration Link */}
          {event.registrationLink && (
            <Section icon={LinkIcon} title="Registration" color="#4f46e5">
              <a
                href={event.registrationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="break-all text-sm font-semibold hover:underline"
                style={{ color: "#4f46e5" }}
                onClick={(e) => e.stopPropagation()}
              >
                {event.registrationLink}
              </a>
            </Section>
          )}
        </div>

        {/* Mini progress bar */}
        <div className="mt-4">
          <div
            className="h-1 w-full rounded-full overflow-hidden"
            style={{ background: "rgba(15,23,42,0.08)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct === 100
                  ? "linear-gradient(90deg, #10b981, #34d399)"
                  : "linear-gradient(90deg, #4f46e5, #7c3aed)",
              }}
            />
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-4 flex items-center justify-between">
          <span
            className="text-sm font-bold"
            style={{ color: "#0f172a", fontFamily: "'JetBrains Mono', monospace" }}
          >
            {total === 0 ? "No tasks yet" : `${done}/${total} complete`}
          </span>
          {canManage && (
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={onEdit}
                aria-label="Edit event"
                className="rounded-full p-1.5 transition-all duration-150"
                style={{ color: "#64748b" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(79,70,229,0.08)";
                  e.currentTarget.style.color = "#4f46e5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748b";
                }}
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={onDelete}
                aria-label="Delete event"
                className="rounded-full p-1.5 transition-all duration-150"
                style={{ color: "#64748b" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(220,38,38,0.08)";
                  e.currentTarget.style.color = "#dc2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#64748b";
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      {onSelect ? (
        <div
          onClick={() => onSelect?.(event)}
          className="flex items-center justify-center gap-2 py-3 text-base font-bold transition-all duration-200"
          style={{
            borderTop: "1px solid rgba(15,23,42,0.08)",
            background: "rgba(79,70,229,0.04)",
            color: "#4f46e5",
            fontFamily: "'Inter', sans-serif",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(79,70,229,0.12), rgba(124,58,237,0.08))";
            e.currentTarget.style.color = "#4338ca";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(79,70,229,0.04)";
            e.currentTarget.style.color = "#4f46e5";
          }}
        >
          Open checklist <ArrowRight size={14} />
        </div>
      ) : (
        <Link
          to={`/events/${event.id}`}
          className="flex items-center justify-center gap-2 py-3 text-base font-bold transition-all duration-200"
          style={{
            borderTop: "1px solid rgba(15,23,42,0.08)",
            background: "rgba(79,70,229,0.04)",
            color: "#4f46e5",
            fontFamily: "'Inter', sans-serif",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(79,70,229,0.12), rgba(124,58,237,0.08))";
            e.currentTarget.style.color = "#4338ca";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(79,70,229,0.04)";
            e.currentTarget.style.color = "#4f46e5";
          }}
        >
          View Details <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}