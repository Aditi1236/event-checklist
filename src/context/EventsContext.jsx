import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { genId } from "../utils/helpers";
import apiClient from "../utils/api";

export const EventsContext = createContext(null);

export function EventsProvider({ children }) {
  const [events, setEvents] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    apiClient
      .listEvents()
      .then((data) => {
        if (active) {
          setEvents(Array.isArray(data) ? data : []);
          setLoaded(true);
        }
      })
      .catch((err) => {
        console.error("Failed to load events from backend", err);
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const api = useMemo(
    () => ({
      events,
      loaded,

      getEvent(eventId) {
        return events.find((e) => e.id === eventId) ?? null;
      },

      createEvent({ name, date, description, location, budget = 0, registrations = 0, teamMembers = "" }) {
        const newEvent = {
          id: genId("evt"),
          name: name.trim(),
          date,
          description: description.trim(),
          location: location.trim(),
          budget: Number(budget) || 0,
          registrations: Number(registrations) || 0,
          teamMembers: teamMembers,
          tasks: [],
          createdAt: Date.now(),
        };
        setEvents((prev) => [newEvent, ...prev]);
        apiClientSafe("createEvent", newEvent);
        return newEvent.id;
      },

      updateEvent(eventId, patch) {
        setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, ...patch } : e)));
        apiClientSafe("updateEvent", eventId, patch);
      },

      deleteEvent(eventId) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        apiClientSafe("deleteEvent", eventId);
      },

      addTask(eventId, { title, description, category, dueDate, priority = "medium" }) {
        const newTask = {
          id: genId("task"),
          title: title.trim(),
          description: description.trim(),
          category,
          dueDate,
          priority,
          completed: false,
          createdAt: Date.now(),
        };
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId ? { ...e, tasks: [...e.tasks, newTask] } : e
          )
        );
        apiClientSafe("addTask", eventId, newTask);
        return newTask.id;
      },

      updateTask(eventId, taskId, patch) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? { ...e, tasks: e.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)) }
              : e
          )
        );
        apiClientSafe("updateTask", eventId, taskId, patch);
      },

      toggleTask(eventId, taskId) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? { ...e, tasks: e.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)) }
              : e
          )
        );
        const event = events.find((e) => e.id === eventId);
        const task = event?.tasks.find((t) => t.id === taskId);
        if (task) apiClientSafe("updateTask", eventId, taskId, { completed: !task.completed });
      },

      deleteTask(eventId, taskId) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId ? { ...e, tasks: e.tasks.filter((t) => t.id !== taskId) } : e
          )
        );
        apiClientSafe("deleteTask", eventId, taskId);
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [events]
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
