import { Link, NavLink, useNavigate } from "react-router-dom";
import { ClipboardCheck, ShieldCheck, LogOut, UserCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const navClass = ({ isActive }) =>
    `relative rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 sm:px-4 sm:text-sm ${
      isActive
        ? "text-indigo-700 bg-indigo-50 border border-indigo-200"
        : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
    }`;

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <header
      className="relative z-30 border-b"
      style={{
        borderColor: "rgba(0,0,0,0.06)",
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6 sm:flex-nowrap">
        {/* Logo */}
        <div className="flex min-w-0 items-center gap-4 sm:gap-6">
          <Link to="/admin/login" className="flex items-center gap-3 group">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition-all duration-300 group-hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                boxShadow: "0 2px 12px rgba(79,70,229,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              <ClipboardCheck size={20} />
            </span>
            <span
              className="font-display text-xl font-bold tracking-tight"
              style={{ fontFamily: "'Sora', sans-serif", color: "#1e293b" }}
            >
              Roster
            </span>
          </Link>

          <nav className="flex items-center gap-1">
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
              <div className="flex items-center gap-2 rounded-full border px-3 py-1.5" style={{ borderColor: "rgba(79,70,229,0.2)", background: "rgba(79,70,229,0.05)" }}>
                {isAdmin ? (
                  <ShieldCheck size={14} style={{ color: "#4f46e5" }} />
                ) : (
                  <UserCheck size={14} style={{ color: "#10b981" }} />
                )}
                <span className="text-xs font-semibold" style={{ color: "#334155" }}>
                  {user.name.split(" ")[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                title="Log out"
                aria-label="Log out"
                className="flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition-all duration-150"
                style={{
                  color: "#64748b",
                  background: "rgba(0,0,0,0.04)",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(220,38,38,0.08)";
                  e.currentTarget.style.color = "#dc2626";
                  e.currentTarget.style.borderColor = "rgba(220,38,38,0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(0,0,0,0.04)";
                  e.currentTarget.style.color = "#64748b";
                  e.currentTarget.style.borderColor = "rgba(0,0,0,0.08)";
                }}
              >
                <LogOut size={15} />
                Logout
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-200 sm:px-6 sm:py-3 sm:text-base"
                style={{
                  color: "#10b981",
                  background: "rgba(16,185,129,0.06)",
                  border: "1px solid rgba(16,185,129,0.2)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(16,185,129,0.12)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(16,185,129,0.06)")}
              >
                <UserCheck size={18} />
                Member Login
              </Link>
              <Link
                to="/admin/login"
                className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 sm:px-6 sm:py-3 sm:text-base"
                style={{
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  boxShadow: "0 2px 12px rgba(79,70,229,0.3)",
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
