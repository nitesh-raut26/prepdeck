import { cn } from "@/lib/cn";
import { CELL_TONE } from "./tones";
import type { AttentionStep } from "@/lib/viz/types";

/** Self-attention as a bar chart: each token's bar is its score (scores phase)
 *  or attention weight (after softmax). The query token is amber, the most-
 *  attended token green. */
export function AttentionCanvas({ step }: { step: AttentionStep }) {
  const show =
    step.phase === "scores"
      ? step.scores
      : step.phase === "softmax" || step.phase === "output"
        ? step.weights
        : undefined;
  const maxVal = show ? Math.max(...show, 0.0001) : 1;

  return (
    <div className="flex min-w-[20rem] flex-col gap-2">
      <div className="flex items-end gap-2">
        {step.tokens.map((t, i) => {
          const isQuery = i === step.query;
          const isDom =
            (step.phase === "softmax" || step.phase === "output") &&
            step.dominant === i;
          const val = show ? show[i] : 0;
          return (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div className="flex h-24 w-full items-end justify-center">
                {show && (
                  <div
                    className={cn(
                      "w-7 rounded-t-md transition-all duration-300",
                      isDom ? "bg-emerald-500/70" : "bg-brand-500/50",
                    )}
                    style={{ height: `${Math.max(4, (val / maxVal) * 100)}%` }}
                  />
                )}
              </div>
              <span className="h-3.5 font-mono text-[10px] text-faint">
                {show
                  ? step.phase === "scores"
                    ? show[i].toFixed(2)
                    : `${Math.round(show[i] * 100)}%`
                  : ""}
              </span>
              <span
                className={cn(
                  "rounded-md border px-2 py-1 font-mono text-xs",
                  isQuery
                    ? CELL_TONE.accent
                    : isDom
                      ? CELL_TONE.good
                      : "border-line bg-surface-3 text-ink",
                )}
              >
                {t}
              </span>
              <span className="h-3 text-[9px] uppercase tracking-wide text-amber-300">
                {isQuery ? "query" : ""}
              </span>
            </div>
          );
        })}
      </div>
      <p className="text-center font-mono text-[11px] text-faint">
        attention(Q, K, V) = softmax(QKᵀ / √d) · V
      </p>
    </div>
  );
}
