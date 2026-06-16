import { cn } from "@/lib/cn";
import type { DriftStep } from "@/lib/viz/types";

const STATUS = {
  healthy: { bar: "bg-emerald-500/70", text: "text-emerald-300", label: "healthy" },
  warning: { bar: "bg-amber-500/70", text: "text-amber-300", label: "drifting" },
  alert: { bar: "bg-rose-500/70", text: "text-rose-300", label: "ALERT — retrain" },
} as const;

/** Reference (training) vs live distribution per bin, plus a PSI meter with the
 *  0.1 / 0.25 thresholds and a status badge. */
export function DriftCanvas({ step }: { step: DriftStep }) {
  const s = STATUS[step.status];
  const maxP = Math.max(...step.reference, ...step.current, 0.01);
  // PSI meter scaled so the 0.25 threshold sits at ~70% of the track.
  const meterPct = Math.min(100, (step.score / 0.36) * 100);

  return (
    <div className="flex min-w-[22rem] flex-col gap-4">
      {/* histograms */}
      <div className="flex items-end gap-2">
        {step.bins.map((b, i) => (
          <div key={b} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-24 w-full items-end justify-center gap-0.5">
              <div
                className="w-3 rounded-t border border-line-strong bg-surface-3"
                style={{ height: `${Math.max(2, (step.reference[i] / maxP) * 100)}%` }}
                title="reference"
              />
              <div
                className={cn("w-3 rounded-t transition-all duration-300", s.bar)}
                style={{ height: `${Math.max(2, (step.current[i] / maxP) * 100)}%` }}
                title="live"
              />
            </div>
            <span className="font-mono text-[9px] text-faint">{b}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 text-[11px] text-faint">
        <span className="inline-flex items-center gap-1">
          <span className="inline-block size-2.5 rounded-sm border border-line-strong bg-surface-3" />
          reference (training)
        </span>
        <span className="inline-flex items-center gap-1">
          <span className={cn("inline-block size-2.5 rounded-sm", s.bar)} />
          live (window t+{step.window})
        </span>
      </div>

      {/* PSI meter */}
      <div className="flex flex-col gap-1 border-t border-line pt-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-faint">PSI (drift score)</span>
          <span className={cn("font-mono font-semibold", s.text)}>
            {step.score.toFixed(3)} · {s.label}
          </span>
        </div>
        <div className="relative h-2 w-full overflow-hidden rounded-full bg-surface-3">
          <div
            className={cn("h-full rounded-full transition-all duration-300", s.bar)}
            style={{ width: `${meterPct}%` }}
          />
          {/* threshold ticks at 0.1 and 0.25 */}
          <span className="absolute top-0 h-full w-px bg-amber-400/70" style={{ left: `${(0.1 / 0.36) * 100}%` }} />
          <span className="absolute top-0 h-full w-px bg-rose-400/80" style={{ left: `${(0.25 / 0.36) * 100}%` }} />
        </div>
        <div className="flex justify-between font-mono text-[9px] text-faint">
          <span>0</span>
          <span>0.1 warn</span>
          <span>0.25 retrain</span>
        </div>
      </div>
    </div>
  );
}
