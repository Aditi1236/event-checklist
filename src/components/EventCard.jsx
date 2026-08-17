import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Pencil, Trash2, ArrowRight } from "lucide-react";
import ProgressStamp from "./ProgressStamp";
import { formatDateShort, progressOf, daysUntil } from "../utils/helpers";

function getDayTagStyle(remaining) {
  if (remaining === null) return null;
  if (remaining === 0) return { label: "Today", bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.3)", color: "#fbbf24" };
  if (remaining > 0 && remaining <= 7) return { label: `In ${remaining}d`, bg: "rgba(225,29,106,0.12)", border: "rgba(225,29,106,0.25)", color: "#fb7aaa" };
  if (remaining > 0) return { label: `In ${remaining}d`, bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.22)", color: "#34d399" };
  return { label: "Past", bg: "rgba(100,116,139,0.12)", border: "rgba(100,116,139,0.2)", color: "#64748b" };
}

export default function EventCard({ event, onEdit, onDelete }) {
  const { done, total, pct } = progressOf(event);
  const remaining = daysUntil(event.date);
  const dayTag = getDayTagStyle(remaining);

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
      {/* Accent top stripe — gradient based on pct */}
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
          <Link to={`/event/${event.id}`} className="min-w-0 flex-1">
            <h3
              className="text-3xl font-black leading-snug line-clamp-2 transition-colors duration-200 group-hover:text-rose-800"
              style={{ fontFamily: "'Sora', sans-serif", color: "#0f172a" }}
            >
              {event.name}
            </h3>
          </Link>
          <ProgressStamp pct={pct} size="sm" />
        </div>

        {/* Meta */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <CalendarDays size={14} style={{ color: "#3b3853" }} />
            <span
              className="text-base font-bold"
              style={{ color: "#0f172a", fontFamily: "'JetBrains Mono', monospace" }}
            >
              {formatDateShort(event.date)}
            </span>
            {dayTag && (
              <span
                className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                style={{
                  background: dayTag.bg,
                  border: `1px solid ${dayTag.border}`,
                  color: dayTag.color,
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
              <span className="text-base font-bold truncate" style={{ color: "#0f172a" }}>{event.location}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="mt-3 text-base font-medium line-clamp-2 leading-relaxed" style={{ color: "#3b3853" }}>
            {event.description}
          </p>
        )}

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
        </div>
      </div>

      {/* CTA */}
      <Link
        to={`/event/${event.id}`}
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
        Open checklist <ArrowRight size={14} />
      </Link>
    </div>
  );
}
