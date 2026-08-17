import { Link, NavLink } from "react-router-dom";
import { ClipboardCheck } from "lucide-react";
import { useEvents } from "../context/EventsContext";

export default function Header() {
  const { events } = useEvents();
  const checklistPath = events.length > 0 ? `/event/${events[0].id}` : "/";

  const navClass = ({ isActive }) =>
    `relative rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${
      isActive
        ? "text-white bg-white/10 border border-white/15"
        : "text-ink-soft hover:text-ink hover:bg-white/6"
    }`;

  return (
    <header
      className="relative z-30 border-b"
      style={{
        borderColor: "rgba(255,255,255,0.07)",
        background: "rgba(10,12,20,0.75)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-all duration-300 group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #e11d6a 0%, #a855f7 100%)",
                boxShadow: "0 0 20px rgba(225,29,106,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <ClipboardCheck size={20} />
            </span>
            <span
              className="font-display text-xl font-bold tracking-tight text-white"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Roster
            </span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            <NavLink to="/" end className={navClass}>
              Events
            </NavLink>
            <NavLink to={checklistPath} className={navClass}>
              Checklist
            </NavLink>
          </nav>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <span className="hidden h-14 w-auto items-center rounded-lg bg-white p-1.5 sm:flex">
            <img
              src="/nexasoul.png"
              alt="NexaSoul"
              className="h-12 w-auto"
            />
          </span>
          <span className="hidden h-14 w-auto items-center rounded-lg bg-white p-1.5 sm:flex">
            <img
              src="/cu-logo.png"
              alt="Chandigarh University"
              className="h-12 w-auto"
            />
          </span>
        </div>
      </div>
    </header>
  );
}
