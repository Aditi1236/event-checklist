export default function Footer() {
  return (
    <footer
      className="mt-auto border-t"
      style={{
        borderColor: "rgba(255,255,255,0.07)",
        background: "rgba(10,12,20,0.6)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Gradient top line */}
      <div
        className="h-px w-full"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(225,29,106,0.4), rgba(168,85,247,0.4), rgba(16,185,129,0.3), transparent)",
        }}
      />
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-5 text-center sm:flex-row sm:px-6 sm:text-left">
        <p
          className="text-base font-bold"
          style={{
            color: "#ffffff",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          © 2026 NexaSoul · Chandigarh University
        </p>
        <p
          className="text-sm font-bold"
          style={{
            fontFamily: "'Sora', sans-serif",
            background: "linear-gradient(90deg, #10b981, #a855f7)",
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
