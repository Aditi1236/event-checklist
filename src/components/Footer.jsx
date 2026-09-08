export default function Footer() {
  return (
    <footer
      className="relative z-20 mt-auto border-t"
      style={{
        borderColor: "rgba(15,23,42,0.06)",
        background: "#ffffff",
      }}
    >
      {/* Gradient top line */}
      <div
        className="h-px w-full"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(79,70,229,0.4), rgba(124,58,237,0.4), rgba(16,185,129,0.3), transparent)",
        }}
      />
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-center sm:flex-row sm:px-6 sm:text-left">
        <p
          className="text-base font-bold"
          style={{
            color: "#334155",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          © 2026 NexaSoul · Chandigarh University
        </p>
        <p
          className="text-sm font-bold"
          style={{
            fontFamily: "'Sora', sans-serif",
            background: "linear-gradient(90deg, #059669, #4f46e5)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Code. Connect. Conquer.
        </p>
      </div>
    </footer>
  );
}