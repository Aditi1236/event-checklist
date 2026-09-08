import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Pencil, Trash2, ArrowRight, Clock, Users, Monitor, Award, BookOpen, Target, Star, Link as LinkIcon, Zap, GraduationCap, UserCheck, Handshake } from "lucide-react";
import ProgressStamp from "./ProgressStamp";
import { formatDateShort, formatDate, progressOf, daysUntil, eventTypeMeta } from "../utils/helpers";

function getDayTagStyle(remaining) {
  if (remaining === null) return null;
  if (remaining === 0) return { label: "Today", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)", color: "#fbbf24" };
  if (remaining > 0 && remaining <= 7) return { label: `In ${remaining}d`, bg: "rgba(225,29,106,0.12)", border: "rgba(225,29,106,0.25)", color: "#fb7aaa" };
  if (remaining > 0) return { label: `In ${remaining}d`, bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.22)", color: "#34d399" };
  return { label: "Past", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.2)", color: "#64748b" };
}

function DetailItem({ icon: Icon, label, value, isLink = false }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <Icon size={14} className="shrink-0 mt-0.5" style={{ color: "#64748b" }} />
      <div className="min-w-0 flex-1">
        <span className="font-medium" style={{ color: "#64748b" }}>{label}: </span>
        {isLink ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all hover:underline"
            style={{ color: "#3b82f6" }}
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
            background: `${color}15`,
            border: `1px solid ${color}30`,
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

  return (
    <div
      className="group relative rounded-2xl flex flex-col transition-all duration-300 animate-fadeIn overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #a9caff 0%, #b8cbff 16.667%, #d3cbff 33.333%, #f0c8f9 50%, #ffc5f1 66.667%, #ffc0ec 83.333%, #ffbaec 100%)",
        border: "1px solid rgba(29,23,51,0.12)",
        backdropFilter: "blur(20px)",
        minHeight: 260,
        boxShadow: "0 1px 3px rgba(29,23,51,0.2), 0 8px 32px -8px rgba(29,23,51,0.25)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(225,29,106,0.45)";
        e.currentTarget.style.boxShadow = "0 0 0 1px rgba(225,29,106,0.2), 0 8px 40px -8px rgba(225,29,106,0.25), 0 2px 4px rgba(29,23,51,0.3)";
        e.currentTarget.style.transform = "translateY(-3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(29,23,51,0.12)";
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(29,23,51,0.2), 0 8px 32px -8px rgba(29,23,51,0.25)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {/* Accent top stripe */}
      <div
        className="h-0.5 w-full"
        style={{
          background: pct === 100
            ? "linear-gradient(90deg, #10b981, #34d399)"
            : "linear-gradient(90deg, #e11d6a, #a855f7)",
          opacity: 0.7,
        }}
      />

      {/* Card body */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Top row */}
        <div className="flex items-start justify-between gap-3">
          {onSelect ? (
            <div
              onClick={() => onSelect(event)}
              className="min-w-0 flex-1 cursor-pointer"
              onMouseEnter={(e) => { e.currentTarget.style.textDecoration = "underline"; }}
              onMouseLeave={(e) => { e.currentTarget.style.textDecoration = "none"; }}
            >
              <span
                className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest mb-2"
                style={{
                  color: "#ffffff",
                  background: `linear-gradient(135deg, ${type.color}, ${type.color}cc)`,
                  boxShadow: `0 0 12px ${type.color}55`,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {type.label}
              </span>
              <h3
                className="text-2xl font-black leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-rose-800 sm:text-3xl"
                style={{ fontFamily: "'Sora', sans-serif", color: "#000000" }}
              >
                {event.name}
              </h3>
            </div>
          ) : (
            <Link to={`/events/${event.id}`} className="min-w-0 flex-1">
              <span
                className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-widest mb-2"
                style={{
                  color: "#ffffff",
                  background: `linear-gradient(135deg, ${type.color}, ${type.color}cc)`,
                  boxShadow: `0 0 12px ${type.color}55`,
                  fontFamily: "'JetBrains Mono', monospace",
                }}
              >
                {type.label}
              </span>
              <h3
                className="text-2xl font-black leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-rose-800 sm:text-3xl"
                style={{ fontFamily: "'Sora', sans-serif", color: "#000000" }}
              >
                {event.name}
              </h3>
            </Link>
          )}
          <ProgressStamp pct={pct} size="sm" />
        </div>

        {/* Meta */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <CalendarDays size={14} style={{ color: "#3b3853" }} />
            <span
              className="text-base font-bold"
              style={{ color: "#111844", fontFamily: "'JetBrains Mono', monospace" }}
            >
              {formatDateShort(event.date)}
              {event.endDate && ` - ${formatDateShort(event.endDate)}`}
            </span>
            {event.duration && (
              <>
                <span style={{ color: "#64748b" }}>•</span>
                <Clock size={14} style={{ color: "#3b3853" }} />
                <span className="text-sm font-semibold" style={{ color: "#111844" }}>
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
              <MapPin size={14} style={{ color: "#3b3853" }} />
              <span className="text-sm font-semibold" style={{ color: "#06263b", fontFamily: "'JetBrains Mono', monospace" }}>
                {event.location}
              </span>
            </div>
          )}
          {event.mode && (
            <div className="flex items-center gap-1.5 flex-wrap text-sm font-semibold" style={{ color: "#4b4660" }}>
              <Monitor size={14} style={{ color: "#3b3853" }} />
              <span className="uppercase tracking-wider">{event.mode}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="mt-3 text-base font-bold line-clamp-2 leading-relaxed" style={{ color: "#0D47A1" }}>
            {event.description}
          </p>
        )}

        {/* Event Details Section */}
        <div className="mt-4 space-y-3">
          {/* Capacity & Registrations for Events */}
          {!isBootcamp && (event.capacity || event.registrations) && (
            <div className="flex flex-wrap gap-4">
              {event.capacity && (
                <DetailItem icon={Users} label="Capacity" value={`${event.capacity} seats`} />
              )}
              {event.registrations && (
                <DetailItem icon={UserCheck} label="Registrations" value={event.registrations} />
              )}
            </div>
          )}

          {/* Bootcamp specific details */}
          {isBootcamp && (
            <div className="space-y-3">
              {event.duration && (
                <DetailItem icon={Clock} label="Duration" value={event.duration} />
              )}
              {event.targetAudience && (
                <DetailItem icon={Target} label="Target Audience" value={event.targetAudience} />
              )}
              {event.prerequisites && (
                <DetailItem icon={BookOpen} label="Prerequisites" value={event.prerequisites} />
              )}
            </div>
          )}

          {/* Tech Stack */}
          {event.techStack && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={14} style={{ color: "#64748b" }} />
                <span className="text-xs font-semibold" style={{ color: "#64748b" }}>Tech Stack</span>
              </div>
              <TagList items={event.techStack} color="#6366f1" />
            </div>
          )}

          {/* Speakers for Bootcamp */}
          {isBootcamp && event.speakers && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Award size={14} style={{ color: "#64748b" }} />
                <span className="text-xs font-semibold" style={{ color: "#64748b" }}>Speakers</span>
              </div>
              <TagList items={event.speakers} color="#8b5cf6" />
            </div>
          )}

          {/* Team Members for Bootcamp */}
          {isBootcamp && event.teamMembers && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users size={14} style={{ color: "#64748b" }} />
                <span className="text-xs font-semibold" style={{ color: "#64748b" }}>Team Members</span>
              </div>
              <TagList items={event.teamMembers} color="#ec4899" />
            </div>
          )}

          {/* Collaborators for Bootcamp */}
          {isBootcamp && event.collaborators && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Handshake size={14} style={{ color: "#64748b" }} />
                <span className="text-xs font-semibold" style={{ color: "#64748b" }}>Collaborators</span>
              </div>
              <TagList items={event.collaborators} color="#10b981" />
            </div>
          )}

          {/* Learning Outcomes for Bootcamp */}
          {isBootcamp && event.learningOutcomes && (
            <DetailItem icon={GraduationCap} label="Learning Outcomes" value={event.learningOutcomes} />
          )}

          {/* Student Benefits for Bootcamp */}
          {isBootcamp && event.studentBenefits && (
            <DetailItem icon={Star} label="Student Benefits" value={event.studentBenefits} />
          )}

          {/* Highlights */}
          {event.highlights && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star size={14} style={{ color: "#64748b" }} />
                <span className="text-xs font-semibold" style={{ color: "#64748b" }}>Highlights</span>
              </div>
              <p className="text-sm whitespace-pre-line" style={{ color: "#334155" }}>
                {event.highlights}
              </p>
            </div>
          )}

          {/* Registration Link */}
          {event.registrationLink && (
            <DetailItem icon={LinkIcon} label="Register" value={event.registrationLink} isLink />
          )}
        </div>

        {/* Mini progress bar */}
        <div className="mt-4">
          <div
            className="h-1 w-full rounded-full overflow-hidden"
            style={{ background: "rgba(29,23,51,0.12)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: pct === 100
                  ? "linear-gradient(90deg, #10b981, #34d399)"
                  : "linear-gradient(90deg, #e11d6a, #a855f7)",
                boxShadow: pct > 0 ? `0 0 6px ${pct === 100 ? "rgba(16,185,129,0.5)" : "rgba(225,29,106,0.4)"}` : "none",
              }}
            />
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-4 flex items-center justify-between">
          <span
            className="text-base font-bold"
            style={{ color: "#0f172a", fontFamily: "'JetBrains Mono', monospace" }}
          >
            {total === 0 ? "No tasks yet" : `${done}/${total} complete`}
          </span>
          {canManage && (
            <div className="flex items-center gap-1">
              <button
                onClick={onEdit}
                aria-label="Edit event"
                className="rounded-full p-1.5 transition-all duration-150"
                style={{ color: "#4b4660" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(29,23,51,0.08)";
                  e.currentTarget.style.color = "#1d1733";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#4b4660";
                }}
              >
                <Pencil size={13} />
              </button>
              <button
                onClick={onDelete}
                aria-label="Delete event"
                className="rounded-full p-1.5 transition-all duration-150"
                style={{ color: "#4b4660" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(225,29,106,0.14)";
                  e.currentTarget.style.color = "#9d174d";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#4b4660";
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
          onClick={() => onSelect(event)}
          className="flex items-center justify-center gap-2 py-3 text-base font-bold transition-all duration-200"
          style={{
            borderTop: "1px solid rgba(29,23,51,0.12)",
            background: "rgba(29,23,51,0.04)",
            color: "#0f172a",
            fontFamily: "'Inter', sans-serif",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(225,29,106,0.18), rgba(168,85,247,0.12))";
            e.currentTarget.style.color = "#9d174d";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(29,23,51,0.04)";
            e.currentTarget.style.color = "#0f172a";
          }}
        >
          Open checklist <ArrowRight size={14} />
        </div>
      ) : (
        <Link
          to={`/events/${event.id}`}
          className="flex items-center justify-center gap-2 py-3 text-base font-bold transition-all duration-200"
          style={{
            borderTop: "1px solid rgba(29,23,51,0.12)",
            background: "rgba(29,23,51,0.04)",
            color: "#0f172a",
            fontFamily: "'Inter', sans-serif",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "linear-gradient(135deg, rgba(225,29,106,0.18), rgba(168,85,247,0.12))";
            e.currentTarget.style.color = "#9d174d";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(29,23,51,0.04)";
            e.currentTarget.style.color = "#0f172a";
          }}
        >
          View Details <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}