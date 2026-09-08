function progressColor(pct) {
  if (pct === 100) return { from: "#10b981", mid: "#34d399", shadow: "rgba(16,185,129,0.4)" };
  if (pct >= 60) return { from: "#7c3aed", mid: "#4f46e5", shadow: "rgba(124,58,237,0.35)" };
  return { from: "#4f46e5", mid: "#7c3aed", shadow: "rgba(79,70,229,0.35)" };
}

export default function ProgressBar({ done, total, className = "", light: _light = false, size = "sm" }) {
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
          style={{ color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}
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
            background: "rgba(15,23,42,0.08)",
            border: "1px solid rgba(15,23,42,0.06)",
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