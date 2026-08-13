import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Pencil, Trash2 } from "lucide-react";
import ProgressStamp from "./ProgressStamp";
import { formatDateShort, progressOf, daysUntil } from "../utils/helpers";

export default function EventCard({ event, onEdit, onDelete }) {
  const { done, total, pct } = progressOf(event);
  const remaining = daysUntil(event.date);

  let dayTag = null;
  if (remaining !== null) {
    if (remaining > 0) dayTag = `In ${remaining} day${remaining === 1 ? "" : "s"}`;
    else if (remaining === 0) dayTag = "Today";
    else dayTag = "Past";
  }

  return (
    <div className="group relative card-surface p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cardHover animate-fadeIn">
      <div className="absolute -top-2 left-6 h-3 w-3 rotate-45 bg-slate" aria-hidden="true" />

      <div className="flex items-start justify-between gap-3">
        <Link to={`/event/${event.id}`} className="min-w-0 flex-1 group/link">
          <h3 className="font-display text-lg font-semibold text-white leading-snug group-hover/link:text-white/90 transition-colors line-clamp-2">
            {event.name}
          </h3>
        </Link>
        <ProgressStamp pct={pct} size="sm" />
      </div>

      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-white/80">
          <CalendarDays size={13} />
          <span className="font-mono">{formatDateShort(event.date)}</span>
          {dayTag && (
            <span
              className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-mono uppercase tracking-wide ${
                remaining < 0
                  ? "bg-white/10 text-white"
                  : remaining === 0
                  ? "bg-amber/15 text-amber-dark"
                  : "bg-white/20 text-white"
              }`}
            >
              {dayTag}
            </span>
          )}
        </div>
        {event.location && (
          <div className="flex items-center gap-1.5 text-xs text-white/80">
            <MapPin size={13} />
            <span className="truncate">{event.location}</span>
          </div>
        )}
      </div>

      {event.description && (
        <p className="mt-3 text-sm text-white/80 line-clamp-2">
          {event.description}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="font-mono text-xs text-white/80">
          {total === 0 ? "No tasks yet" : `${done}/${total} tasks complete`}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={onEdit}
            aria-label="Edit event"
            className="rounded-full p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={onDelete}
            aria-label="Delete event"
            className="rounded-full p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <Link
        to={`/event/${event.id}`}
        className="mt-4 flex items-center justify-center rounded-full border border-white/20 py-2 text-sm font-semibold text-white/90 transition-colors hover:bg-white hover:text-primary-dark"
      >
        Open checklist
      </Link>
    </div>
  );
}
