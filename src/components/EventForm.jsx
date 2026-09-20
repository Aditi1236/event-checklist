import { useState } from "react";
import Modal from "./Modal";
import { EVENT_TYPES } from "../utils/helpers";
import { ChevronDown, ChevronUp } from "lucide-react";

const empty = {
  name: "",
  date: "",
  endDate: "",
  duration: "",
  category: "",
  description: "",
  location: "",
  teamMembers: "",
  type: "event",
};

function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(15,23,42,0.1)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold text-left transition-colors"
        style={{
          background: "rgba(15,23,42,0.03)",
          color: "#0f172a",
          fontFamily: "'Sora', sans-serif",
        }}
      >
        {title}
        {open ? <ChevronUp size={15} style={{ color: "#64748b" }} /> : <ChevronDown size={15} style={{ color: "#64748b" }} />}
      </button>
      {open && (
        <div className="px-4 pb-4 pt-3 space-y-4" style={{ background: "rgba(15,23,42,0.02)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

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
    <Modal title={isEdit ? "Edit Event" : "Create Event / Bootcamp"} onClose={onClose} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>

        {/* ── Type selector ── */}
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
                      : { color: "#475569", borderColor: "rgba(15,23,42,0.15)" }
                  }
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Basic Info ── */}
        <Section title="📋 Basic Information">
          {/* Name */}
          <div>
            <label className="field-label" htmlFor="event-name">
              {isBootcamp ? "Bootcamp Name" : "Event Name"} *
            </label>
            <input
              id="event-name"
              className="field-input"
              placeholder={isBootcamp ? "CodeFlow JS: JavaScript Essentials Bootcamp" : "WebVerse: Foundations of Modern Web Development"}
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              autoFocus
            />
            {errors.name && <p className="mt-1 text-xs" style={{ color: "#dc2626" }}>{errors.name}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="event-date">
                {isBootcamp ? "Start Date" : "Event Date"} *
              </label>
              <input
                id="event-date"
                type="date"
                className="field-input"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
              />
              {errors.date && <p className="mt-1 text-xs" style={{ color: "#dc2626" }}>{errors.date}</p>}
            </div>
            <div>
              <label className="field-label" htmlFor="event-enddate">
                {isBootcamp ? "End Date" : "End Date (optional)"}
              </label>
              <input
                id="event-enddate"
                type="date"
                className="field-input"
                value={form.endDate}
                onChange={(e) => update("endDate", e.target.value)}
              />
            </div>
          </div>

          {/* Duration & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="event-duration">
                Duration
              </label>
              <input
                id="event-duration"
                className="field-input"
                placeholder={isBootcamp ? "4 weeks" : "3 hours"}
                value={form.duration}
                onChange={(e) => update("duration", e.target.value)}
              />
            </div>
            <div>
              <label className="field-label" htmlFor="event-category">
                Category / Type
              </label>
              <input
                id="event-category"
                className="field-input"
                placeholder={isBootcamp ? "Skill Bootcamp" : "Awareness Session"}
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="field-label" htmlFor="event-location">
              Venue / Location
            </label>
            <input
              id="event-location"
              className="field-input"
              placeholder={isBootcamp ? "Online / Room 412, Block B" : "Main Auditorium, Block A"}
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
            />
          </div>

          {/* Organizing Team */}
          <div>
            <label className="field-label" htmlFor="event-team">
              Organizing Team Members (comma-separated)
            </label>
            <input
              id="event-team"
              className="field-input"
              placeholder="Alice, Bob, Charlie"
              value={form.teamMembers}
              onChange={(e) => update("teamMembers", e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="field-label" htmlFor="event-description">
              Short Description
            </label>
            <textarea
              id="event-description"
              className="field-input min-h-[80px] resize-y"
              placeholder="A brief overview shown on the event listing card…"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
        </Section>

        {/* ── Submit ── */}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {isEdit ? "Save Changes" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
}