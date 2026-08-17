import { useState } from "react";
import Modal from "./Modal";
import { CATEGORIES } from "../utils/helpers";

const empty = { title: "", description: "", category: "before", dueDate: "" };

const ACCENT_CLASSES = {
  slate: {
    active: "border-slate bg-slate text-paper-soft",
    idle: "border-slate/25 text-slate hover:bg-slate/5",
  },
  amber: {
    active: "border-amber bg-amber text-paper-soft",
    idle: "border-amber/40 text-amber-dark hover:bg-amber/10",
  },
  plum: {
    active: "border-plum bg-plum text-paper-soft",
    idle: "border-plum/40 text-plum hover:bg-plum/10",
  },
};

export default function TaskForm({ initial, onSubmit, onClose }) {
  const [form, setForm] = useState(initial ? { ...empty, ...initial } : empty);
  const [error, setError] = useState("");
  const isEdit = Boolean(initial);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Give the task a title.");
      return;
    }
    onSubmit(form);
  }

  return (
    <Modal title={isEdit ? "Edit task" : "Add task"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label className="field-label" htmlFor="task-title">
            Title
          </label>
          <input
            id="task-title"
            className="field-input"
            placeholder="Book the sound system"
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            autoFocus
          />
          {error && <p className="mt-1 text-xs text-rust">{error}</p>}
        </div>

        <div>
          <label className="field-label" htmlFor="task-description">
            Description
          </label>
          <textarea
            id="task-description"
            className="field-input min-h-[80px] resize-y"
            placeholder="Add details, links, or notes"
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
          />
        </div>

        <div>
          <label className="field-label" htmlFor="task-duedate">
            Due Date (Optional)
          </label>
          <input
            id="task-duedate"
            type="date"
            className="field-input"
            value={form.dueDate}
            onChange={(e) => update("dueDate", e.target.value)}
          />
        </div>

        <div>
          <span className="field-label">Category</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const isActive = form.category === c.key;
              const cls = ACCENT_CLASSES[c.accent];
              return (
                <button
                  type="button"
                  key={c.key}
                  onClick={() => update("category", c.key)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    isActive ? cls.active : cls.idle
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn-primary">
            {isEdit ? "Save changes" : "Add task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
