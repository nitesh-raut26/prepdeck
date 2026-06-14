import { cn } from "@/lib/cn";
import { CELL_TONE } from "./tones";
import type { TokenBucketStep } from "@/lib/viz/types";

/** Renders one frame of the token-bucket limiter: the bucket fill, the request
 *  being judged, and a rolling ✓/✗ history strip. */
export function TokenBucketCanvas({ step }: { step: TokenBucketStep }) {
  const pips = Array.from({ length: step.capacity }, (_, i) => i < step.tokens);
  const refilling = step.phase === "refill" || step.phase === "start";

  return (
    <div className="flex min-w-[18rem] flex-col gap-4">
      {/* refill drip + clock */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px]",
            refilling
              ? CELL_TONE.good
              : "border-line bg-surface-3 text-subtle",
          )}
        >
          ↓ refill {step.rate}/s
        </span>
        <span className="rounded-md border border-line bg-surface-3 px-2 py-1 font-mono text-[11px] text-subtle">
          t = {step.time}s
        </span>
      </div>

      {/* the bucket */}
      <div className="flex items-center gap-3">
        <span className="w-16 shrink-0 text-[11px] font-medium uppercase tracking-wide text-faint">
          bucket
        </span>
        <div className="flex flex-wrap gap-1.5">
          {pips.map((filled, i) => (
            <div
              key={i}
              className={cn(
                "size-8 rounded-lg border transition-colors",
                filled ? CELL_TONE.good : CELL_TONE.idle,
              )}
            />
          ))}
        </div>
        <span className="ml-1 font-mono text-xs text-subtle">
          {step.tokens}/{step.capacity}
        </span>
      </div>

      {/* current request verdict */}
      <div className="flex items-center gap-3">
        <span className="w-16 shrink-0 text-[11px] font-medium uppercase tracking-wide text-faint">
          request
        </span>
        {step.request ? (
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs",
              step.phase === "allow" ? CELL_TONE.good : CELL_TONE.bad,
            )}
          >
            {step.request} {step.phase === "allow" ? "✓ forwarded" : "✗ 429"}
          </span>
        ) : (
          <span className="text-xs text-faint">— (refilling)</span>
        )}
      </div>

      {/* rolling outcome history */}
      {step.log.length > 0 && (
        <div className="flex items-center gap-3">
          <span className="w-16 shrink-0 text-[11px] font-medium uppercase tracking-wide text-faint">
            history
          </span>
          <div className="flex flex-wrap gap-1">
            {step.log.map((o, i) => (
              <span
                key={i}
                title={`${o.label} ${o.ok ? "allowed" : "rejected"}`}
                className={cn(
                  "flex size-6 items-center justify-center rounded-md border font-mono text-[10px]",
                  o.ok ? CELL_TONE.good : CELL_TONE.bad,
                )}
              >
                {o.ok ? "✓" : "✗"}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
