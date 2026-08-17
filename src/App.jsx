import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Dashboard from "./pages/Dashboard";
import EventDetail from "./pages/EventDetail";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/event/:eventId" element={<EventDetail />} />
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
