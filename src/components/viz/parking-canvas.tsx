"use client";

import { cn } from "@/lib/cn";
import type { ParkingStep } from "@/lib/viz/types";
import { CELL_TONE } from "./tones";

const SIZE_LABEL = { M: "moto", C: "compact", L: "large" } as const;

/** A row of parking spots; the scan cursor walks left→right from the entrance. */
export function ParkingCanvas({ step }: { step: ParkingStep }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-end gap-2 overflow-x-auto pb-1">
        <span className="shrink-0 self-center font-mono text-[10px] uppercase tracking-wide text-faint">
          entrance →
        </span>
        {step.spots.map((sp) => {
          const isCursor = step.cursor === sp.id;
          return (
            <div key={sp.id} className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "font-mono text-[11px]",
                  isCursor ? "text-brand-400" : "text-transparent",
                )}
                aria-hidden
              >
                ▼
              </span>
              <div
                className={cn(
                  "flex h-16 w-14 flex-col items-center justify-center rounded-lg border-2 font-mono transition-colors",
                  sp.tone
                    ? CELL_TONE[sp.tone]
                    : sp.occupant
                      ? "border-line-strong bg-surface-3 text-ink"
                      : "border-dashed border-line-strong bg-surface-1 text-faint",
                )}
              >
                <span className="text-[9px] uppercase tracking-wide opacity-70">
                  {SIZE_LABEL[sp.size]}
                </span>
                <span className="text-[14px] font-bold leading-tight">
                  {sp.occupant ?? "·"}
                </span>
                <span className="text-[9px] opacity-60">spot {sp.id}</span>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-faint">
        dashed = free · a vehicle takes the nearest spot ranked its size or larger
      </p>
    </div>
  );
}
