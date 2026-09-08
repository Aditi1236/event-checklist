import { AlertTriangle } from "lucide-react";
import Modal from "./Modal";

export default function ConfirmDialog({
  title = "Are you sure?",
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}) {
  return (
    <Modal title={title} onClose={onCancel} maxWidth="max-w-sm">
      <div className="flex gap-3 mb-6">
        <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626" }}>
          <AlertTriangle size={18} />
        </div>
        <p className="text-sm text-ink-soft leading-relaxed pt-1">{message}</p>
      </div>
      <div className="flex justify-end gap-2">
        <button className="btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn-danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
