import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export default function Modal({ title, onClose, children, maxWidth = "max-w-lg" }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] overflow-y-auto animate-fadeIn"
      style={{ background: "rgba(15,23,42,0.5)", backdropFilter: "blur(8px)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex justify-center p-4">
        <div
          className={`my-8 w-full ${maxWidth} animate-popIn rounded-2xl`}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          style={{
            background: "#ffffff",
            border: "1px solid rgba(15,23,42,0.1)",
            boxShadow: "0 0 0 1px rgba(79,70,229,0.06), 0 24px 60px -16px rgba(15,23,42,0.2)",
          }}
        >
          {/* Accent top border */}
          <div
            className="h-px w-full"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(79,70,229,0.5), rgba(124,58,237,0.35), transparent)",
            }}
          />

          {/* Header */}
          <div
            className="flex items-center justify-between rounded-t-2xl px-6 py-4"
            style={{
              background: "#f8fafc",
              borderBottom: "1px solid rgba(15,23,42,0.06)",
            }}
          >
            <h2
              className="text-lg font-bold"
              style={{ fontFamily: "'Sora', sans-serif", color: "#0f172a" }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150"
              style={{ color: "#64748b", background: "transparent" }}
              aria-label="Close dialog"
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(79,70,229,0.08)";
                e.currentTarget.style.color = "#4f46e5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#64748b";
              }}
            >
              <X size={17} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>,
    document.body
  );
}