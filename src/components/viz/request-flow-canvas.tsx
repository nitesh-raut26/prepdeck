import { cn } from "@/lib/cn";
import { CELL_TONE } from "./tones";
import type { RequestFlowStep } from "@/lib/viz/types";

function Arrow() {
  return <span className="px-0.5 text-faint">→</span>;
}

function Tier({
  active,
  tone = "active",
  children,
}: {
  active: boolean;
  tone?: keyof typeof CELL_TONE;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex min-w-[3.75rem] flex-col items-center justify-center rounded-xl border px-3 py-2 text-center text-xs transition-colors",
        active ? CELL_TONE[tone] : "border-line bg-surface-2 text-faint",
      )}
    >
      {children}
    </div>
  );
}

/** A request walking the tiers: Client → LB → App×N → Cache → DB. The lit tier
 *  is the current stage; the cache shows hit/miss and the DB lights only on a miss. */
export function RequestFlowCanvas({ step }: { step: RequestFlowStep }) {
  const lit = (s: RequestFlowStep["stage"]) => step.stage === s;

  return (
    <div className="flex min-w-[22rem] flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide text-faint">
          request
        </span>
        <span className="rounded-md border border-line bg-surface-3 px-2 py-0.5 font-mono text-xs text-ink">
          {step.request}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <Tier active={lit("client") || lit("respond")} tone={lit("respond") ? "good" : "active"}>
          Client
        </Tier>
        <Arrow />
        <Tier active={lit("lb")}>LB</Tier>
        <Arrow />

        {/* app server bank */}
        <div
          className={cn(
            "flex flex-col items-center gap-1 rounded-xl border px-2.5 py-1.5",
            lit("app") ? "border-brand-500 bg-brand-600/10" : "border-line bg-surface-2",
          )}
        >
          <span className="text-[10px] uppercase tracking-wide text-faint">
            app ×{step.serverCount}
          </span>
          <div className="flex gap-1">
            {Array.from({ length: step.serverCount }, (_, i) => (
              <span
                key={i}
                className={cn(
                  "flex size-6 items-center justify-center rounded-md border font-mono text-[10px]",
                  step.activeServer === i
                    ? CELL_TONE.active
                    : "border-line bg-surface-3 text-faint",
                )}
              >
                {i}
              </span>
            ))}
          </div>
        </div>
        <Arrow />

        <Tier
          active={lit("cache")}
          tone={step.cacheOutcome === "hit" ? "good" : step.cacheOutcome === "miss" ? "bad" : "active"}
        >
          <span>Cache</span>
          {step.cacheOutcome && (
            <span className="mt-0.5 font-mono text-[10px] font-semibold">
              {step.cacheOutcome === "hit" ? "HIT" : "MISS"}
            </span>
          )}
        </Tier>
        <Arrow />
        <Tier active={lit("db")} tone="bad">
          DB
        </Tier>
      </div>
    </div>
  );
}
