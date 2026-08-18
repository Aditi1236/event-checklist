const SIZE_MAP = {
  sm: { box: 48, stroke: 4, font: "text-base" },
  md: { box: 60, stroke: 5, font: "text-base" },
  lg: { box: 64, stroke: 5, font: "text-xl" },
  xl: { box: 96, stroke: 7, font: "text-3xl" },
};

function getRingColor(pct) {
  if (pct === 100) return "#10b981";          // emerald
  if (pct >= 60)   return "#a855f7";          // purple
  if (pct >= 30)   return "#f59e0b";          // amber
  return "#e11d6a";                           // rose
}

export default function ProgressStamp({ pct, size = "md", complete }) {
  const { box, stroke, font } = SIZE_MAP[size];
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const isComplete = complete ?? pct === 100;
  const ringColor = getRingColor(pct);

  return (
    <div
      className="relative shrink-0"
      style={{ width: box, height: box }}
      role="img"
      aria-label={`${pct} percent complete`}
    >
      <svg width={box} height={box} className="-rotate-90">
        {/* Track circle */}
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke="rgba(29,23,51,0.12)"
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease",
            filter: `drop-shadow(0 0 4px ${ringColor}88)`,
          }}
        />
      </svg>
      <div
        className={`absolute inset-0 flex items-center justify-center font-extrabold ${font}`}
        style={{
          color: isComplete ? "#0f9d6b" : "#063B00",
          fontFamily: "'JetBrains Mono', monospace",
          textShadow: isComplete ? "0 0 8px rgba(16,185,129,0.4)" : "none",
        }}
      >
        {pct}%
      </div>
    </div>
  );
}
