function progressColor(pct) {
  if (pct === 100) return { from: "#10b981", mid: "#34d399", shadow: "rgba(16,185,129,0.5)" };
  if (pct >= 60) return { from: "#a855f7", mid: "#e11d6a", shadow: "rgba(168,85,247,0.45)" };
  return { from: "#e11d6a", mid: "#a855f7", shadow: "rgba(225,29,106,0.45)" };
}

export default function ProgressBar({ done, total, className = "", light = false, size = "sm" }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const colors = progressColor(pct);
  const track = size === "lg" ? "h-5" : "h-2.5";
  const label = size === "lg" ? "text-sm" : "text-[10px]";
  const count = size === "lg" ? "text-base" : "text-xs";

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <span
          className={`${label} uppercase tracking-widest font-bold`}
          style={{ color: light ? "#4b4660" : "#f1f5f9", fontFamily: "'JetBrains Mono', monospace" }}
        >
          Progress
        </span>
        <span
          className={`${count} font-extrabold`}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            background: `linear-gradient(90deg, ${colors.from}, ${colors.mid})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {done}/{total} tasks
        </span>
      </div>
      {/* Track */}
      <div
        className={`${track} w-full rounded-full overflow-hidden`}
          style={{
            background: light ? "rgba(29,23,51,0.1)" : "rgba(255,255,255,0.07)",
            border: `1px solid ${light ? "rgba(29,23,51,0.1)" : "rgba(255,255,255,0.06)"}`,
          }}
      >
        {/* Fill */}
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${colors.from}, ${colors.mid})`,
            backgroundSize: "200% 100%",
            boxShadow: `0 0 10px ${colors.shadow}, 0 0 20px ${colors.shadow}40`,
            animation: pct < 100 ? "shimmer 2.5s linear infinite" : "none",
          }}
        />
      </div>
    </div>
  );
}
