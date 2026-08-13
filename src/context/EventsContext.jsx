import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { genId, loadEvents, saveEvents } from "../utils/helpers";

const EventsContext = createContext(null);

export function EventsProvider({ children }) {
  const [events, setEvents] = useState(() => loadEvents());

  useEffect(() => {
    saveEvents(events);
  }, [events]);

  const api = useMemo(
    () => ({
      events,

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
        return newEvent.id;
      },

      updateEvent(eventId, patch) {
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, ...patch } : e))
        );
      },

      deleteEvent(eventId) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
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
      },

      updateTask(eventId, taskId, patch) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  tasks: e.tasks.map((t) =>
                    t.id === taskId ? { ...t, ...patch } : t
                  ),
                }
              : e
          )
        );
      },

      toggleTask(eventId, taskId) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? {
                  ...e,
                  tasks: e.tasks.map((t) =>
                    t.id === taskId ? { ...t, completed: !t.completed } : t
                  ),
                }
              : e
          )
        );
      },

      deleteTask(eventId, taskId) {
        setEvents((prev) =>
          prev.map((e) =>
            e.id === eventId
              ? { ...e, tasks: e.tasks.filter((t) => t.id !== taskId) }
              : e
          )
        );
      },
    }),
    [events]
  );

  return (
    <EventsContext.Provider value={api}>{children}</EventsContext.Provider>
  );
}

export function useEvents() {
  const ctx = useContext(EventsContext);
  if (!ctx) throw new Error("useEvents must be used within EventsProvider");
  return ctx;
}
