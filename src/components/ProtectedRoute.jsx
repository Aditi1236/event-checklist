import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = true }) {
  const { user, loaded } = useAuth();
  const location = useLocation();
  // Each role has its own login portal. Admin routes bounce to the admin
  // portal, member routes bounce to the member portal.
  const loginPath = adminOnly ? "/admin/login" : "/login";

  if (!loaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full"
          style={{
            border: "3px solid rgba(255,255,255,0.1)",
            borderTopColor: "#e11d6a",
            boxShadow: "0 0 20px rgba(225,29,106,0.25)",
          }}
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={loginPath} state={{ from: location.pathname }} replace />;
  }

  // Wrong portal for this role? Send them to their own dashboard.
  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/me" replace />;
  }

  if (!adminOnly && user.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}