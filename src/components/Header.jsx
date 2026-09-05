import { Link, NavLink, useNavigate } from "react-router-dom";
import { ClipboardCheck, ShieldCheck, LogOut, UserCheck } from "lucide-react";
import { useEvents } from "../context/EventsContext";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { events } = useEvents();
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const checklistPath = events.length > 0 ? `/event/${events[0].id}` : "/";

  const navClass = ({ isActive }) =>
    `relative rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 sm:px-4 sm:text-sm ${
      isActive
        ? "text-white bg-white/10 border border-white/15"
        : "text-ink-soft hover:text-ink hover:bg-white/6"
    }`;

  function handleLogout() {
    logout();
    navigate("/");
  }

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
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6 sm:flex-nowrap">
        {/* Logo */}
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
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

          <nav className="flex items-center gap-1">
            <NavLink to="/" end className={navClass}>
              Events
            </NavLink>
            <NavLink to={checklistPath} className={navClass}>
              Checklist
            </NavLink>
            {user && !isAdmin && (
              <NavLink to="/me" className={navClass}>
                My Tasks
              </NavLink>
            )}
            {isAdmin && (
              <NavLink to="/admin" className={navClass}>
                Admin
              </NavLink>
            )}
          </nav>
        </div>

        {/* Right side */}
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 rounded-full border px-3 py-1.5" style={{ borderColor: "rgba(225,29,106,0.3)", background: "rgba(225,29,106,0.08)" }}>
                {isAdmin ? (
                  <ShieldCheck size={14} style={{ color: "#fb7aaa" }} />
                ) : (
                  <UserCheck size={14} style={{ color: "#34d399" }} />
                )}
                <span className="text-xs font-semibold" style={{ color: "#f1f5f9" }}>
                  {user.name.split(" ")[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
                className="flex h-9 w-9 items-center justify-center rounded-full transition-all duration-150"
                style={{ color: "#64748b", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(225,29,106,0.15)";
                  e.currentTarget.style.color = "#fb7aaa";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "#64748b";
                }}
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 sm:px-6 sm:py-3 sm:text-base"
                style={{
                  color: "#34d399",
                  background: "rgba(16,185,129,0.1)",
                  border: "1px solid rgba(16,185,129,0.3)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(16,185,129,0.2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(16,185,129,0.1)")}
              >
                <UserCheck size={18} />
                Member Login
              </Link>
              <Link
                to="/admin/login"
                className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 sm:px-6 sm:py-3 sm:text-base"
                style={{
                  background: "linear-gradient(135deg, #e11d6a 0%, #a855f7 100%)",
                  boxShadow: "0 4px 14px rgba(225,29,106,0.35)",
                }}
              >
                <ShieldCheck size={18} />
                Admin Login
              </Link>
            </div>
          )}
          <span className="flex h-11 w-auto items-center rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm sm:h-14 sm:p-2">
            <img
              src="/nexasoul.png"
              alt="NexaSoul"
              className="h-9 w-auto max-w-[110px] object-contain sm:h-12 sm:max-w-[140px]"
            />
          </span>
          <span className="flex h-11 w-auto items-center rounded-lg border border-slate-200 bg-white p-1.5 shadow-sm sm:h-14 sm:p-2">
            <img
              src="/cu-logo.png"
              alt="Chandigarh University"
              className="h-9 w-auto max-w-[110px] object-contain sm:h-12 sm:max-w-[140px]"
            />
          </span>
        </div>
      </div>
    </header>
  );
}
