import { cn } from "@/lib/cn";
import { CELL_TONE } from "./tones";
import type { IsolationStep } from "@/lib/viz/types";

/** Two transaction lanes (T1/T2) with an interleaved op timeline; the critical
 *  read lights green (prevented) or rose (anomaly), with the verdict below. */
export function IsolationCanvas({ step }: { step: IsolationStep }) {
  const cols = step.ops.length;
  const grid = `repeat(${cols}, minmax(4.75rem, 1fr))`;

  return (
    <div className="flex min-w-[24rem] flex-col gap-3">
      {(["T1", "T2"] as const).map((txn) => (
        <div key={txn} className="flex items-center gap-2">
          <span className="w-7 shrink-0 font-mono text-xs font-semibold text-subtle">
            {txn}
          </span>
          <div className="grid flex-1 gap-1" style={{ gridTemplateColumns: grid }}>
            {step.ops.map((o, i) =>
              o.txn === txn ? (
                <div
                  key={i}
                  style={{ gridColumn: i + 1 }}
                  className={cn(
                    "rounded-md border px-1.5 py-1 text-center font-mono text-[10px] leading-tight",
                    CELL_TONE[o.tone ?? "idle"],
                  )}
                >
                  {o.label}
                </div>
              ) : null,
            )}
          </div>
        </div>
      ))}

      <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">
        <span className="rounded-md border border-line bg-surface-3 px-2 py-0.5 font-mono text-[11px] text-subtle">
          {step.level}
        </span>
        {step.t1Sees != null && (
          <span className="rounded-md border border-line bg-surface-2 px-2 py-0.5 font-mono text-[11px] text-subtle">
            T1 sees <span className="text-ink">{step.t1Sees}</span>
          </span>
        )}
        {step.verdict && (
          <span
            className={cn(
              "rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold",
              step.verdict === "anomaly" ? CELL_TONE.bad : CELL_TONE.good,
            )}
          >
            {step.verdict === "anomaly" ? "✗ anomaly allowed" : "✓ prevented"}
          </span>
        )}
      </div>
    </div>
  );
}
