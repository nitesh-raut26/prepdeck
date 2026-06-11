"use client";

import { cn } from "@/lib/cn";
import type { ArrayStep, Tone } from "@/lib/viz/types";
import { CELL_TONE, TEXT_TONE } from "./tones";

/** Renders one ArrayStep as a row of cells with index labels and pointers. */
export function ArrayCanvas({ step }: { step: ArrayStep }) {
  const { values, tones = {}, spans = [], pointers = [] } = step;

  const toneAt = (i: number): Tone => {
    if (tones[i]) return tones[i];
    const span = spans.find((s) => i >= s.from && i <= s.to);
    return span ? span.tone : "idle";
  };

  return (
    <div className="mx-auto flex min-w-max items-start justify-center gap-1.5">
      {values.map((v, i) => {
        const ptrs = pointers.filter((p) => p.index === i);
        return (
          <div key={i} className="flex w-10 flex-col items-center gap-1 sm:w-11">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg border font-mono text-[13px] font-medium transition-colors duration-200 sm:h-11 sm:w-11",
                CELL_TONE[toneAt(i)],
              )}
            >
              {v}
            </div>
            <span className="font-mono text-[10px] text-faint">{i}</span>
            <span className="flex h-4 items-start">
              {ptrs.length > 0 && (
                <span
                  className={cn(
                    "whitespace-nowrap font-mono text-[10px] font-semibold leading-none",
                    TEXT_TONE[ptrs[0].tone ?? "active"],
                  )}
                >
                  ▲ {ptrs.map((p) => p.label).join("·")}
                </span>
              )}
            </span>
          </div>
        );
      })}
      {values.length === 0 && (
        <span className="text-xs text-faint">(empty)</span>
      )}
    </div>
  );
}
