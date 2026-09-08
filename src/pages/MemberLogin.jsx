import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { UserCheck, Lock, Mail, ArrowLeft, Sparkles, User, HelpCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import apiClient from "../utils/api";

const SECURITY_QUESTIONS = [
  "What was the name of your first pet?",
  "What is your mother's maiden name?",
  "What city were you born in?",
  "What is your favorite book?",
];

export default function MemberLogin() {
  const { login, signup, logout, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: Answer & New Pass
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [fetchedQuestion, setFetchedQuestion] = useState("");
  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) {
    navigate(user.role === "admin" ? "/admin" : "/me", { replace: true });
    return null;
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
        await signup(name.trim(), email.trim(), password, "member", securityQuestion, securityAnswer);
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
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
          style={{ color: "#94a3b8" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#f1f5f9")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#94a3b8")}
        >
          <ArrowLeft size={15} />
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
                {isForgotPassword ? "Reset Password" : isSignUp ? "Member Sign Up" : "Member Login"}
              </h1>
              <p className="mt-2 text-sm font-medium" style={{ color: "#94a3b8" }}>
                {isForgotPassword ? "Answer your security question to reset." : isSignUp ? "Create your executive portal account." : "Executive portal — view and update your assigned tasks."}
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
                        size={16}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                        style={{ color: "#64748b" }}
                      />
                      <input
                        id="forgot-email"
                        type="email"
                        className="field-input pl-11"
                        placeholder="you@nexasoul.com"
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
                      <label className="field-label" style={{ color: "#e2e8f0" }}>
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
                        className="field-input"
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
                      color: "#fda4af",
                      background: "rgba(225,29,106,0.12)",
                      border: "1px solid rgba(225,29,106,0.3)",
                    }}
                  >
                    {error}
                  </p>
                )}

                <button type="submit" className="btn-accent w-full !py-3" disabled={busy}>
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
                    style={{ color: "#94a3b8" }}
                    className="hover:text-white transition-colors hover:underline"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            ) : (
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
                        style={{ color: "#34d399" }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}
                </div>

                {isSignUp && (
                  <>
                    <div>
                      <label className="field-label" htmlFor="member-sec-question">
                        Security Question
                      </label>
                      <div className="relative">
                        <HelpCircle
                          size={16}
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                          style={{ color: "#64748b" }}
                        />
                        <select
                          id="member-sec-question"
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
                      <label className="field-label" htmlFor="member-sec-answer">
                        Security Answer
                      </label>
                      <input
                        id="member-sec-answer"
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
                      color: "#fda4af",
                      background: "rgba(225,29,106,0.12)",
                      border: "1px solid rgba(225,29,106,0.3)",
                    }}
                  >
                    {error}
                  </p>
                )}
                
                {successMsg && (
                  <p
                    className="rounded-xl px-4 py-3 text-sm font-semibold"
                    style={{
                      color: "#6ee7b7",
                      background: "rgba(16,185,129,0.12)",
                      border: "1px solid rgba(16,185,129,0.3)",
                    }}
                  >
                    {successMsg}
                  </p>
                )}

                <button type="submit" className="btn-accent w-full !py-3" disabled={busy}>
                  {busy ? (isSignUp ? "Signing up…" : "Signing in…") : (isSignUp ? "Sign Up as Member" : "Sign in as Member")}
                </button>
              </form>
            )}

            {!isForgotPassword && (
              <div className="mt-6 text-center text-sm font-medium" style={{ color: "#94a3b8" }}>
                {isSignUp ? "Already have a member account? " : "Don't have a member account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError("");
                    setSuccessMsg("");
                  }}
                  className="font-bold transition-colors hover:underline"
                  style={{ color: "#34d399" }}
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </div>
            )}

            {!isForgotPassword && (
              <p className="mt-4 text-center text-xs font-medium" style={{ color: "#64748b" }}>
                Are you an admin?{" "}
                <Link
                  to="/admin/login"
                  className="font-bold transition-colors hover:underline"
                  style={{ color: "#fb7aaa" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#fda4af")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#fb7aaa")}
                >
                  Go to Admin Login →
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}