import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Lock, Mail, ArrowLeft, User, HelpCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../utils/api";

const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What is your favorite book?",
];

export default function AdminLogin() {
  const { login, signup, logout, user } = useAuth();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: Answer & New Pass
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("admin@nexasoul.com");
  const [password, setPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [fetchedQuestion, setFetchedQuestion] = useState("");
  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    if (user.role === "admin") {
      navigate("/admin", { replace: true });
      return null;
    } else {
      navigate("/login", { replace: true });
      return null;
    }
  }

  async function handleForgotSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setBusy(true);
    try {
      if (forgotStep === 1) {
        const res = await apiClient.getSecurityQuestion(email.trim());
        setFetchedQuestion(res.question);
        setForgotStep(2);
      } else {
        await apiClient.resetPassword(email.trim(), securityAnswer, password);
        setSuccessMsg("Password reset successful! You can now log in.");
        setIsForgotPassword(false);
        setForgotStep(1);
        setPassword("");
        setSecurityAnswer("");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setBusy(true);
    try {
      if (isSignUp) {
        await signup(name.trim(), email.trim(), password, "admin", securityQuestion, securityAnswer);
      } else {
        const u = await login(email.trim(), password);
        if (u.role !== "admin") {
          await logout();
          setError("This portal is for Admins only. Please use the Member Login.");
          return;
        }
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
        <div className="orb orb-rose" />
        <div className="orb orb-purple" />
      </div>

      <div className="relative z-10 w-full max-w-lg animate-fadeIn">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
          style={{ color: "#64748b" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#4f46e5")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
        >
          <ArrowLeft size={15} />
        </Link>
        <div
           className="rounded-3xl overflow-hidden"
           style={{
             background: "#ffffff",
             border: "1px solid rgba(15,23,42,0.08)",
             boxShadow: "0 24px 60px -16px rgba(15,23,42,0.18)",
           }}
         >
          <div
            className="h-px w-full"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(79,70,229,0.6), rgba(124,58,237,0.4), transparent)",
            }}
          />

          <div className="p-8">
            <div className="mb-8 text-center">
              <div
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  boxShadow: "0 4px 16px rgba(79,70,229,0.35)",
                }}
              >
                <ShieldCheck size={28} className="text-white" />
              </div>
              <h1
                className="text-3xl font-extrabold text-slate-900"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                {isForgotPassword ? "Reset Password" : isSignUp ? "Admin Sign Up" : "Admin Login"}
              </h1>
              <p className="mt-2 text-base font-semibold" style={{ color: "#64748b" }}>
                {isForgotPassword ? "Answer your security question to reset." : isSignUp ? "Create an admin account for NexaSoul." : "Manage events, tasks, members and progress for NexaSoul."}
              </p>
            </div>

            {isForgotPassword ? (
              <form onSubmit={handleForgotSubmit} className="space-y-4" noValidate>
                {forgotStep === 1 ? (
                  <div>
                    <label className="field-label" htmlFor="forgot-email">
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        size={20}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                        style={{ color: "#64748b" }}
                      />
                      <input
                        id="forgot-email"
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
                ) : (
                  <>
                    <div>
                      <label className="field-label" style={{ color: "#64748b" }}>
                        Security Question
                      </label>
                      <p className="text-sm font-medium italic mb-2" style={{ color: "#94a3b8" }}>
                        {fetchedQuestion}
                      </p>
                    </div>
                    <div>
                      <label className="field-label" htmlFor="forgot-answer">
                        Answer
                      </label>
                      <input
                        id="forgot-answer"
                        type="text"
                        className="field-input !py-3 !text-base"
                        placeholder="Your answer"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="field-label" htmlFor="forgot-password">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock
                          size={16}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                          style={{ color: "#64748b" }}
                        />
                        <input
                          id="forgot-password"
                          type="password"
                          className="field-input pl-11"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {error && (
                  <p
                    className="rounded-xl px-4 py-3 text-sm font-semibold"
                    style={{
                      color: "#b91c1c",
                      background: "rgba(220,38,38,0.06)",
                      border: "1px solid rgba(220,38,38,0.15)",
                    }}
                  >
                    {error}
                  </p>
                )}

                <button type="submit" className="btn-accent w-full !py-4 !text-base font-bold" disabled={busy}>
                  {busy ? "Loading…" : forgotStep === 1 ? "Next" : "Reset Password"}
                </button>
                
                <div className="mt-4 text-center text-sm font-medium">
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPassword(false);
                      setForgotStep(1);
                      setError("");
                    }}
                    style={{ color: "#64748b" }}
                    className="hover:text-slate-900 transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {isSignUp && (
                  <div>
                    <label className="field-label" htmlFor="admin-name">
                      Name
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                        style={{ color: "#64748b" }}
                      />
                      <input
                        id="admin-name"
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
                      autoFocus={!isSignUp}
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
                  {!isSignUp && (
                    <div className="mt-2 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setError("");
                          setSuccessMsg("");
                        }}
                        className="text-xs font-semibold hover:underline"
                        style={{ color: "#4f46e5" }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>

                {isSignUp && (
                  <>
                    <div>
                      <label className="field-label" htmlFor="admin-sec-question">
                        Security Question
                      </label>
                      <div className="relative">
                        <HelpCircle
                          size={16}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                          style={{ color: "#64748b" }}
                        />
                        <select
                          id="admin-sec-question"
                          className="field-input pl-11 appearance-none"
                          value={securityQuestion}
                          onChange={(e) => setSecurityQuestion(e.target.value)}
                          required
                        >
                          {SECURITY_QUESTIONS.map(q => (
                            <option key={q} value={q}>{q}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="field-label" htmlFor="admin-sec-answer">
                        Security Answer
                      </label>
                      <input
                        id="admin-sec-answer"
                        type="text"
                        className="field-input"
                        placeholder="Your answer"
                        value={securityAnswer}
                        onChange={(e) => setSecurityAnswer(e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}

                {error && (
                  <p
                    className="rounded-xl px-4 py-3 text-sm font-semibold"
                    style={{
                      color: "#b91c1c",
                      background: "rgba(220,38,38,0.06)",
                      border: "1px solid rgba(220,38,38,0.15)",
                    }}
                  >
                    {error}
                  </p>
                )}
                
                {successMsg && (
                  <p
                    className="rounded-xl px-4 py-3 text-sm font-semibold"
                    style={{
                      color: "#059669",
                      background: "rgba(16,185,129,0.08)",
                      border: "1px solid rgba(16,185,129,0.2)",
                    }}
                  >
                    {successMsg}
                  </p>
                )}

                <button type="submit" className="btn-accent w-full !py-3" disabled={busy}>
                  {busy ? (isSignUp ? "Signing up…" : "Signing in…") : (isSignUp ? "Sign Up as Admin" : "Sign in as Admin")}
                </button>
              </form>
            )}

            {!isForgotPassword && (
              <div className="mt-6 text-center text-base font-semibold" style={{ color: "#64748b" }}>
                {isSignUp ? "Already have an admin account? " : "Don't have an admin account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="font-bold transition-colors hover:underline"
                  style={{ color: "#4f46e5" }}
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </div>
            )}

            {!isForgotPassword && (
              <p className="mt-4 text-center text-sm font-semibold" style={{ color: "#64748b" }}>
                Are you an executive member?{" "}
                <Link
                  to="/login"
                  className="font-bold transition-colors hover:underline"
                  style={{ color: "#059669" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#10b981")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#059669")}
                >
                  Go to Member Login →
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}