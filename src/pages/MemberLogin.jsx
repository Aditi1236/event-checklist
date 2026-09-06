import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { UserCheck, Lock, Mail, ArrowLeft, Sparkles, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function MemberLogin() {
  const { login, signup, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    navigate(user.role === "admin" ? "/admin" : "/me", { replace: true });
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (isSignUp) {
        await signup(name.trim(), email.trim(), password, "member");
        const dest = location.state?.from || "/me";
        navigate(dest, { replace: true });
      } else {
        const u = await login(email.trim(), password);
        // This portal is for executive members only — bounce admins out.
        if (u.role === "admin") {
          await logout();
          setError("This portal is for Executive Members only. Please use the Admin Login.");
          return;
        }
        const dest = location.state?.from || "/me";
        navigate(dest, { replace: true });
      }
    } catch (err) {
      setError(err.message || (isSignUp ? "Sign up failed" : "Login failed"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="ambient-bg">
        <div className="orb orb-emerald" />
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
             boxShadow: "0 32px 80px -16px rgba(0,0,0,0.8), 0 0 80px -20px rgba(16,185,129,0.2)",
           }}
         >
          <div
            className="h-px w-full"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.7), rgba(168,85,247,0.5), transparent)",
            }}
          />

          <div className="p-8">
            <div className="mb-8 text-center">
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                  boxShadow: "0 0 30px rgba(16,185,129,0.45), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                <UserCheck size={28} className="text-white" />
              </div>
              <h1
                className="text-3xl font-extrabold text-white"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {isSignUp ? "Member Sign Up" : "Member Login"}
              </h1>
              <p className="mt-2 text-sm font-medium" style={{ color: "#94a3b8" }}>
                {isSignUp ? "Create your executive portal account." : "Executive portal — view and update your assigned tasks."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {isSignUp && (
                <div>
                  <label className="field-label" htmlFor="member-name">
                    Name
                  </label>
                  <div className="relative">
                    <User
                      size={16}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                      style={{ color: "#64748b" }}
                    />
                    <input
                      id="member-name"
                      type="text"
                      className="field-input pl-11"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoFocus
                      required
                    />
                  </div>
                </div>
              )}
              <div>
                <label className="field-label" htmlFor="member-email">
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "#64748b" }}
                  />
                  <input
                    id="member-email"
                    type="email"
                    className="field-input pl-11"
                    placeholder="you@nexasoul.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus={!isSignUp}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="field-label" htmlFor="member-password">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "#64748b" }}
                  />
                  <input
                    id="member-password"
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
                {busy ? (isSignUp ? "Signing up…" : "Signing in…") : (isSignUp ? "Sign Up as Member" : "Sign in as Member")}
              </button>
            </form>

            <div className="mt-6 text-center text-sm font-medium" style={{ color: "#94a3b8" }}>
              {isSignUp ? "Already have a member account? " : "Don't have a member account? "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError("");
                }}
                className="font-bold transition-colors"
                style={{ color: "#34d399" }}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>

            <p className="mt-4 text-center text-xs font-medium" style={{ color: "#64748b" }}>
              Are you an admin?{" "}
              <Link
                to="/admin/login"
                className="font-bold transition-colors"
                style={{ color: "#fb7aaa" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#fda4af")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#fb7aaa")}
              >
                Go to Admin Login →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}