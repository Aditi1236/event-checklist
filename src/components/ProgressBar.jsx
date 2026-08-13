export default function ProgressBar({ done, total, className = "" }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const complete = total > 0 && done === total;

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-soft">
          Progress
        </span>
        <span className="font-mono text-xs font-semibold text-ink">
          {done}/{total} tasks
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-paper-line overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            complete ? "bg-emerald" : "bg-slate"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
