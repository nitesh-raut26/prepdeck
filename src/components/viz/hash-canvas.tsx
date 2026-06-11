"use client";

import { cn } from "@/lib/cn";
import type { HashStep } from "@/lib/viz/types";
import { CELL_TONE } from "./tones";

/** Hash table as a column of drawers; each drawer shows its chain. */
export function HashCanvas({ step }: { step: HashStep }) {
  const { buckets, activeBucket, keyTones = {} } = step;

  return (
    <div className="mx-auto flex w-fit flex-col gap-1">
      {buckets.map((chain, b) => (
        <div
          key={b}
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-lg border px-2 py-1 transition-colors",
            activeBucket === b
              ? "border-brand-500/60 bg-brand-600/10"
              : "border-line bg-surface-2/40",
          )}
        >
          <span
            className={cn(
              "w-14 font-mono text-[11px]",
              activeBucket === b ? "text-brand-300" : "text-faint",
            )}
          >
            drawer {b}
          </span>
          <div className="flex min-w-36 items-center gap-1">
            {chain.length === 0 && (
              <span className="text-[11px] text-faint">—</span>
            )}
            {chain.map((k, i) => (
              <span key={`${k}-${i}`} className="flex items-center gap-1">
                {i > 0 && <span className="text-[10px] text-faint">→</span>}
                <span
                  className={cn(
                    "flex h-8 min-w-9 items-center justify-center rounded-md border px-1.5 font-mono text-xs transition-colors",
                    CELL_TONE[keyTones[k] ?? "idle"],
                  )}
                >
                  {k}
                </span>
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
