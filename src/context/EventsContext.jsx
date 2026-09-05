import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { genId } from "../utils/helpers";
import apiClient from "../utils/api";

export const EventsContext = createContext(null);

export function EventsProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // Timestamp of the last local write. Used to avoid a background refresh
  // clobbering a change the current user just made but that hasn't reached
  // the server yet.
  const lastWriteRef = useRef(0);

  // Pull the latest events from the server. `force` ignores the write guard
  // (used for the initial load and explicit refreshes).
  const refresh = useCallback(async (force = false) => {
    if (!force && Date.now() - lastWriteRef.current < 1500) return;
    try {
      const data = await apiClient.listEvents();
      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to sync events from backend", err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refresh(true).finally(() => setLoaded(true));
  }, [refresh]);

  // Real-time sync: on a normal Node server the backend pushes a notification
  // (SSE) whenever any user changes data, so every client re-fetches instantly.
  // On Vercel (serverless) SSE is unreliable, so we rely on polling there.
  const isVercel = import.meta.env.VERCEL;

  useEffect(() => {
    if (isVercel) return;
    let es;
    try {
      es = new EventSource("/api/events/stream");
      es.onmessage = () => refresh();
      es.onerror = () => {
        /* EventSource auto-reconnects; the polling fallback also covers this */
      };
    } catch {
      /* EventSource unavailable — polling fallback handles it */
    }
    return () => es && es.close();
  }, [refresh, isVercel]);

  // Polling keeps every device in sync. Snappier on Vercel (no SSE), still a
  // backup elsewhere.
  useEffect(() => {
    const interval = isVercel ? 4000 : 5000;
    const id = setInterval(() => refresh(), interval);
    return () => clearInterval(id);
  }, [refresh, isVercel]);

  const markWrite = () => {
    lastWriteRef.current = Date.now();
  };

  const api = useMemo(
    () => ({
      events,
      loaded,

      refresh,

      getEvent(eventId) {
        return events.find((e) => e.id === eventId) ?? null;
      },

      createEvent({ name, date, description, location, budget = 0, registrations = 0, teamMembers = "", type = "event", endDate = "", mode = "", capacity = 0, techStack = "" }) {
        const newEvent = {
          id: genId("evt"),
          name: name.trim(),
          type,
          date,
          endDate,
          description: description.trim(),
          location: location.trim(),
          mode,
          capacity: Number(capacity) || 0,
          techStack: String(techStack || "").trim(),
          budget: Number(budget) || 0,
          registrations: Number(registrations) || 0,
          teamMembers: teamMembers,
          tasks: [],
          createdAt: Date.now(),
        };
        markWrite();
        setEvents((prev) => [newEvent, ...prev]);
        apiClientSafe("createEvent", newEvent);
        return newEvent.id;
      },

      updateEvent(eventId, patch) {
        markWrite();
        setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, ...patch } : e)));
        apiClientSafe("updateEvent", eventId, patch);
      },

      deleteEvent(eventId) {
        markWrite();
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        apiClientSafe("deleteEvent", eventId);
      },

      addTask(eventId, { title, description, category, dueDate, priority = "medium", assigneeId = null, status: st = "pending" }) {
        const newTask = {
          id: genId("task"),
          title: title.trim(),
          description: description.trim(),
          category,
          dueDate,
          priority,
          status: st,
          completed: st === "completed",
          assigneeId: assigneeId || null,
          createdAt: Date.now(),
        };
        markWrite();
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId ? { ...e, tasks: [...e.tasks, newTask] } : e
          )
        );
        apiClientSafe("addTask", eventId, newTask);
        return newTask.id;
      },

      updateTask(eventId, taskId, patch) {
        markWrite();
        let appliedPatch = { ...patch };
        if (patch.status !== undefined) {
          appliedPatch.completed = patch.status === "completed";
        } else if (patch.completed !== undefined) {
          const evt = events.find((e) => e.id === eventId);
          const t = evt?.tasks.find((x) => x.id === taskId);
          const cur = t?.status ?? (t?.completed ? "completed" : "pending");
          appliedPatch.status = patch.completed ? "completed" : cur === "completed" ? "pending" : cur;
        }
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? { ...e, tasks: e.tasks.map((t) => (t.id === taskId ? { ...t, ...appliedPatch } : t)) }
              : e
          )
        );
        apiClientSafe("updateTask", eventId, taskId, appliedPatch);
      },

      toggleTask(eventId, taskId) {
        const event = events.find((e) => e.id === eventId);
        const task = event?.tasks.find((t) => t.id === taskId);
        if (!task) return;
        const completed = !task.completed;
        const status = completed ? "completed" : task.status === "in_progress" ? "in_progress" : "pending";
        this.updateTask(eventId, taskId, { completed, status });
      },

      deleteTask(eventId, taskId) {
        markWrite();
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId ? { ...e, tasks: e.tasks.filter((t) => t.id !== taskId) } : e
          )
        );
        apiClientSafe("deleteTask", eventId, taskId);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events, refresh]
  );

  return <EventsContext.Provider value={api}>{children}</EventsContext.Provider>;
}

// Fire-and-forget API sync that never throws into the UI
function apiClientSafe(method, ...args) {
  const map = {
    createEvent: (event) => apiClient.createEvent(event),
    updateEvent: (id, patch) => apiClient.updateEvent(id, patch),
    deleteEvent: (id) => apiClient.deleteEvent(id),
    addTask: (id, task) => apiClient.addTask(id, task),
    updateTask: (id, taskId, patch) => apiClient.updateTask(id, taskId, patch),
    deleteTask: (id, taskId) => apiClient.deleteTask(id, taskId),
  };
  Promise.resolve(map[method](...args)).catch((err) =>
    console.error(`Backend sync failed for ${method}`, err)
  );
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents must be used within EventsProvider");
  return ctx;
}
