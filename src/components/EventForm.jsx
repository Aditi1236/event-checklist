import { useState } from "react";
import Modal from "./Modal";

const empty = { name: "", date: "", description: "", location: "", budget: "", registrations: "", teamMembers: "" };

export default function EventForm({ initial, onSubmit, onClose }) {
  const [form, setForm] = useState(initial ? { ...empty, ...initial } : empty);
  const [errors, setErrors] = useState({});
  const isEdit = Boolean(initial);

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
    <Modal title={isEdit ? "Edit event" : "Create event"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="field-label" htmlFor="event-name">
            Event name
          </label>
          <input
            id="event-name"
            className="field-input"
            placeholder="Spring Cultural Fest"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            autoFocus
          />
          {errors.name && (
            <p className="mt-1 text-xs text-rust">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="field-label" htmlFor="event-date">
            Date
          </label>
          <input
            id="event-date"
            type="date"
            className="field-input"
            value={form.date}
            onChange={(e) => update("date", e.target.value)}
          />
          {errors.date && (
            <p className="mt-1 text-xs text-rust">{errors.date}</p>
          )}
        </div>

        <div>
          <label className="field-label" htmlFor="event-location">
            Location
          </label>
          <input
            id="event-location"
            className="field-input"
            placeholder="Main Auditorium"
            value={form.location}
            onChange={(e) => update("location", e.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="event-description">
            Description
          </label>
          <textarea
            id="event-description"
            className="field-input min-h-[90px] resize-y"
            placeholder="What is this event about?"
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
            {isEdit ? "Save changes" : "Create event"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
