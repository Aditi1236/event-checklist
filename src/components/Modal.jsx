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
      style={{ background: "rgba(5,7,15,0.75)", backdropFilter: "blur(8px)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`my-8 w-full ${maxWidth} animate-popIn rounded-2xl`}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          style={{
            background: "rgba(15,17,30,0.92)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 0 0 1px rgba(225,29,106,0.15), 0 32px 80px -16px rgba(0,0,0,0.8), 0 0 80px -20px rgba(225,29,106,0.15)",
          }}
        >
        {/* Rose accent top border */}
        <div
          className="h-px w-full"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(225,29,106,0.6), rgba(168,85,247,0.4), transparent)",
          }}
        />

        {/* Header */}
        <div
          className="sticky top-0 flex items-center justify-between rounded-t-2xl px-6 py-4"
          style={{
            background: "#0b0c16",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h2
            className="text-lg font-bold text-white"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition-all duration-150"
            style={{ color: "#64748b", background: "transparent" }}
            aria-label="Close dialog"
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(225,29,106,0.12)";
              e.currentTarget.style.color = "#fb7aaa";
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
