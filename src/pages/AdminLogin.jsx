import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Lock, Mail, ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Dashboard from "./Dashboard";

export default function AdminLogin() {
  const { login, logout, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@nexasoul.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    if (user.role === "admin") {
      // Render dashboard for admins instead of redirecting
      return <Dashboard />;
    } else {
      // Bounce members to the member portal
      navigate("/", { replace: true });
      return null;
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const u = await login(email.trim(), password);
      // This portal is for admins only — bounce members to the member portal.
      if (u.role !== "admin") {
        await logout();
        setError("This portal is for Admins only. Please use the Member Login.");
        return;
      }
      // For admins, we render dashboard directly (handled above)
      // No need to redirect; the component will re-render with user set.
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="ambient-bg">
        <div className="orb orb-rose" />
        <div className="orb orb-purple" />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fadeIn">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          style={{ color: "#64748b" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f1f5f9")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
        >
          <ArrowLeft size={15} />
          Back to events
        </Link>

<div
           className="rounded-3xl overflow-hidden"
           style={{
             background: "#622569",
             border: "1px solid rgba(255,255,255,0.1)",
             backdropFilter: "blur(24px)",
             boxShadow: "0 32px 80px -16px rgba(0,0,0,0.8), 0 0 80px -20px rgba(225,29,106,0.2)",
           }}
         >
          <div
            className="h-px w-full"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(225,29,106,0.7), rgba(168,85,247,0.5), transparent)",
            }}
          />

          <div className="p-8">
            <div className="mb-8 text-center">
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, #e11d6a 0%, #a855f7 100%)",
                  boxShadow: "0 0 30px rgba(225,29,106,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <ShieldCheck size={28} className="text-white" />
              </div>
              <h1
                className="text-3xl font-extrabold text-white"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Admin Login
              </h1>
              <p className="mt-2 text-sm font-medium" style={{ color: "#94a3b8" }}>
                Manage events, tasks, members and progress for NexaSoul.
              </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label className="field-label" htmlFor="admin-email">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "#64748b" }}
                  />
                  <input
                    id="admin-email"
                    type="email"
                    className="field-input pl-11"
                    placeholder="admin@nexasoul.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                    required
                  />
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="admin-password">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "#64748b" }}
                  />
                  <input
                    id="admin-password"
                    type="password"
                    className="field-input pl-11"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {error && (
                <p
                  className="rounded-xl px-4 py-3 text-sm font-semibold"
                  style={{
                    color: "#fda4af",
                    background: "rgba(225,29,106,0.12)",
                    border: "1px solid rgba(225,29,106,0.3)",
                  }}
                >
                  {error}
                </p>
              )}

              <button type="submit" className="btn-accent w-full !py-3" disabled={busy}>
                {busy ? "Signing in…" : "Sign in as Admin"}
              </button>
            </form>

            <div
              className="mt-6 flex items-center gap-2 rounded-xl px-4 py-3 text-[11px] font-semibold"
              style={{
                color: "#94a8b8",
                background: "rgba(168,85,247,0.06)",
                border: "1px solid rgba(168,85,247,0.18)",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              <Sparkles size={13} style={{ color: "#a855f7" }} />
              Default: admin@nexasoul.com · admin123
            </div>

            <p className="mt-4 text-center text-xs font-medium" style={{ color: "#64748b" }}>
              Are you an executive member?{" "}
              <Link
                to="/login"
                className="font-bold transition-colors"
                style={{ color: "#34d399" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#6ee7b7")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#34d399")}
              >
                Go to Member Login →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}