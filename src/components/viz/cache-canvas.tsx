import { cn } from "@/lib/cn";
import { CELL_TONE } from "./tones";
import type { CacheStep } from "@/lib/viz/types";

/** One frame of the read-through cache: the request verdict, the cache cells
 *  (MRU→LRU), whether the slow store was hit, and a running hit-rate meter. */
export function CacheCanvas({ step }: { step: CacheStep }) {
  const total = step.hits + step.misses;
  const rate = total ? Math.round((step.hits / total) * 100) : 0;
  const slow = step.phase === "miss" || step.phase === "evict";

  return (
    <div className="flex min-w-[20rem] flex-col gap-4">
      {/* request + verdict */}
      <div className="flex items-center gap-3">
        <span className="w-16 shrink-0 text-[11px] font-medium uppercase tracking-wide text-faint">
          request
        </span>
        {step.request ? (
          <span className="inline-flex items-center gap-2">
            <span className="rounded-lg border border-line bg-surface-3 px-2.5 py-1 font-mono text-xs text-ink">
              {step.request}
            </span>
            {step.phase !== "start" && (
              <span
                className={cn(
                  "rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold",
                  step.phase === "hit" ? CELL_TONE.good : CELL_TONE.bad,
                )}
              >
                {step.phase === "hit" ? "HIT" : "MISS"}
              </span>
            )}
          </span>
        ) : (
          <span className="text-xs text-faint">—</span>
        )}
      </div>

      {/* cache cells */}
      <div className="flex items-center gap-3">
        <span className="w-16 shrink-0 text-[11px] font-medium uppercase tracking-wide text-faint">
          cache
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          {Array.from({ length: step.capacity }, (_, i) => {
            const cell = step.cache[i];
            return cell ? (
              <div
                key={i}
                className={cn(
                  "flex size-9 items-center justify-center rounded-lg border font-mono text-xs",
                  CELL_TONE[cell.tone ?? "idle"],
                )}
              >
                {cell.key}
              </div>
            ) : (
              <div
                key={i}
                className="flex size-9 items-center justify-center rounded-lg border border-dashed border-line text-faint"
              >
                ·
              </div>
            );
          })}
          <span className="ml-1 text-[11px] text-faint">MRU → LRU</span>
        </div>
      </div>

      {/* backing store */}
      <div className="flex items-center gap-3">
        <span className="w-16 shrink-0 text-[11px] font-medium uppercase tracking-wide text-faint">
          store
        </span>
        <span
          className={cn(
            "rounded-lg border px-2.5 py-1 text-xs",
            slow ? CELL_TONE.bad : "border-line bg-surface-2 text-faint",
          )}
        >
          {slow ? "slow fetch → fill cache" : "untouched (served from memory)"}
        </span>
      </div>

      {/* hit-rate meter */}
      <div className="flex items-center gap-3">
        <span className="w-16 shrink-0 text-[11px] font-medium uppercase tracking-wide text-faint">
          hit rate
        </span>
        <span className="h-2 w-40 overflow-hidden rounded-full bg-surface-3">
          <span
            className="block h-full rounded-full bg-emerald-500/70 transition-all duration-300"
            style={{ width: `${rate}%` }}
          />
        </span>
        <span className="font-mono text-[11px] text-subtle">
          {rate}% · {step.hits}H / {step.misses}M
        </span>
      </div>
    </div>
  );
}
