const SIZE_MAP = {
  sm: { box: 44, stroke: 4, font: "text-[11px]" },
  md: { box: 60, stroke: 5, font: "text-sm" },
  lg: { box: 84, stroke: 6, font: "text-lg" },
};

export default function ProgressStamp({ pct, size = "md", complete }) {
  const { box, stroke, font } = SIZE_MAP[size];
  const radius = (box - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  const isComplete = complete ?? pct === 100;

  return (
    <div
      className="relative shrink-0"
      style={{ width: box, height: box }}
      role="img"
      aria-label={`${pct} percent complete`}
    >
      <svg width={box} height={box} className="-rotate-90">
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke="rgb(var(--color-paper-line))"
          strokeWidth={stroke}
        />
        <circle
          cx={box / 2}
          cy={box / 2}
          r={radius}
          fill="none"
          stroke={isComplete ? "rgb(var(--color-emerald))" : "rgb(var(--color-slate))"}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.5s ease, stroke 0.3s ease" }}
        />
      </svg>
      <div
        className={`absolute inset-0 flex items-center justify-center font-mono font-semibold ${font} ${
          isComplete ? "text-emerald" : "text-slate"
        }`}
      >
        {pct}%
      </div>
    </div>
  );
}
