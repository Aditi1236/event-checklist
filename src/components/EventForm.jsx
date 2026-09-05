import { useState } from "react";
import Modal from "./Modal";
import { EVENT_TYPES } from "../utils/helpers";

const empty = {
  name: "",
  date: "",
  description: "",
  location: "",
  budget: "",
  registrations: "",
  teamMembers: "",
  type: "event",
  endDate: "",
  mode: "offline",
  capacity: "",
  techStack: "",
};

export default function EventForm({ initial, onSubmit, onClose }) {
  const [form, setForm] = useState(initial ? { ...empty, ...initial } : empty);
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(initial);
  const isBootcamp = form.type === "bootcamp";

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    const next = {};
    if (!form.name.trim()) next.name = "Give the event a name.";
    if (!form.date) next.date = "Pick a date.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  }

  return (
    <Modal title={isEdit ? "Edit event" : "Create event"} onClose={onClose} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <span className="field-label">Type</span>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map((t) => {
              const isActive = form.type === t.key;
              return (
                <button
                  type="button"
                  key={t.key}
                  onClick={() => update("type", t.key)}
                  className="rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                  style={
                    isActive
                      ? { color: "#ffffff", background: t.color, borderColor: t.color }
                      : { color: "#94a3b8", borderColor: "rgba(255,255,255,0.12)" }
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="field-label" htmlFor="event-name">
            {isBootcamp ? "Bootcamp name" : "Event name"}
          </label>
          <input
            id="event-name"
            className="field-input"
            placeholder={isBootcamp ? "JavaScript Bootcamp 2026" : "Spring Cultural Fest"}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            autoFocus
          />
          {errors.name && <p className="mt-1 text-xs text-rust">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="event-date">
              Start Date
            </label>
            <input
              id="event-date"
              type="date"
              className="field-input"
              value={form.date}
              onChange={(e) => update("date", e.target.value)}
            />
            {errors.date && <p className="mt-1 text-xs text-rust">{errors.date}</p>}
          </div>
          {isBootcamp ? (
            <div>
              <label className="field-label" htmlFor="event-enddate">
                End Date
              </label>
              <input
                id="event-enddate"
                type="date"
                className="field-input"
                value={form.endDate}
                onChange={(e) => update("endDate", e.target.value)}
              />
            </div>
          ) : (
            <div>
              <label className="field-label" htmlFor="event-registrations">
                Registrations
              </label>
              <input
                id="event-registrations"
                type="number"
                className="field-input"
                placeholder="0"
                value={form.registrations}
                onChange={(e) => update("registrations", e.target.value)}
              />
            </div>
          )}
        </div>

        {isBootcamp && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="event-mode">
                Mode
              </label>
              <select
                id="event-mode"
                className="field-input"
                value={form.mode}
                onChange={(e) => update("mode", e.target.value)}
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="event-capacity">
                Capacity
              </label>
              <input
                id="event-capacity"
                type="number"
                className="field-input"
                placeholder="0"
                value={form.capacity}
                onChange={(e) => update("capacity", e.target.value)}
              />
            </div>
          </div>
        )}
<div>
          <label className="field-label" htmlFor="event-location">
            Location
          </label>
          <input
            id="event-location"
            className="field-input"
            placeholder={isBootcamp ? "Online / Room 412" : "Main Auditorium"}
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
          />
        </div>

        {isBootcamp && (
          <div>
            <label className="field-label" htmlFor="event-techstack">
              Tech Stack (comma-separated)
            </label>
            <input
              id="event-techstack"
              className="field-input"
              placeholder="React, Node.js, MongoDB"
              value={form.techStack}
              onChange={(e) => update("techStack", e.target.value)}
            />
          </div>
        )}

        <div>
          <label className="field-label" htmlFor="event-description">
            Description
          </label>
          <textarea
            id="event-description"
            className="field-input min-h-[90px] resize-y"
            placeholder="What is this about?"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="event-budget">
              Budget ($)
            </label>
            <input
              id="event-budget"
              type="number"
              className="field-input"
              placeholder="0"
              value={form.budget}
              onChange={(e) => update("budget", e.target.value)}
            />
          </div>
          {!isBootcamp && (
            <div>
              <label className="field-label" htmlFor="event-registrations2">
                Registrations
              </label>
              <input
                id="event-registrations2"
                type="number"
                className="field-input"
                placeholder="0"
                value={form.registrations}
                onChange={(e) => update("registrations", e.target.value)}
              />
            </div>
          )}
        </div>

        <div>
          <label className="field-label" htmlFor="event-team">
            Team Members (comma-separated)
          </label>
          <input
            id="event-team"
            className="field-input"
            placeholder="Alice, Bob, Charlie"
            value={form.teamMembers}
            onChange={(e) => update("teamMembers", e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {isEdit ? "Save changes" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}