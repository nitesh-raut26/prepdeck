"use client";

import { cn } from "@/lib/cn";
import type { BoxesStep } from "@/lib/viz/types";
import { CELL_TONE } from "./tones";

/** Stack (vertical, top at the top) or queue (horizontal, front at the left). */
export function BoxesCanvas({
  step,
  mode,
}: {
  step: BoxesStep;
  mode: "stack" | "queue";
}) {
  const { items, tones = {} } = step;

  if (mode === "stack") {
    return (
      <div className="mx-auto flex w-fit flex-col items-center">
        <span className="mb-1.5 font-mono text-[10px] uppercase tracking-wide text-faint">
          top
        </span>
        <div className="flex min-h-44 flex-col-reverse justify-start gap-1 rounded-xl border border-dashed border-line-strong p-2">
          {items.length === 0 && (
            <span className="px-6 py-2 text-xs text-faint">(empty)</span>
          )}
          {items.map((v, i) => (
            <div
              key={i}
              className={cn(
                "flex h-9 w-24 items-center justify-center rounded-lg border font-mono text-[13px] transition-colors",
                CELL_TONE[tones[i] ?? "idle"],
              )}
            >
              {v}
            </div>
          ))}
        </div>
        <span className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-faint">
          bottom
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-w-max items-center justify-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-wide text-faint">
        front →
      </span>
      <div className="flex min-h-12 min-w-28 items-center gap-1 rounded-xl border border-dashed border-line-strong p-2">
        {items.length === 0 && (
          <span className="px-4 text-xs text-faint">(empty)</span>
        )}
        {items.map((v, i) => (
          <div
            key={i}
            className={cn(
              "flex h-9 w-12 items-center justify-center rounded-lg border font-mono text-[13px] transition-colors",
              CELL_TONE[tones[i] ?? "idle"],
            )}
          >
            {v}
          </div>
        ))}
      </div>
      <span className="font-mono text-[10px] uppercase tracking-wide text-faint">
        ← back
      </span>
    </div>
  );
}
