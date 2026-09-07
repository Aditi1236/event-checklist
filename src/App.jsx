import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import EventDetail from "./pages/EventDetail";
import EventInfoPage from "./pages/EventInfoPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import MemberLogin from "./pages/MemberLogin";
import MyTasks from "./pages/MyTasks";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/admin/login" replace />} />
          <Route path="/event/:eventId" element={<EventDetail />} />
          <Route path="/events/:eventId" element={<EventInfoPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/login" element={<MemberLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute adminOnly>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/me"
            element={
              <ProtectedRoute adminOnly={false}>
                <MyTasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <div className="mx-auto max-w-xl px-6 py-24 text-center">
                <h1 className="font-display text-2xl font-semibold text-ink">
                  Page not found
                </h1>
              </div>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
