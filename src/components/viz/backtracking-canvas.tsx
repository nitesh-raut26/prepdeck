"use client";

import { cn } from "@/lib/cn";
import type { BoardStep, SubsetStep } from "@/lib/viz/types";
import { CELL_TONE } from "./tones";

/* ── N-Queens board ───────────────────────────────────────────────────── */

export function BoardCanvas({ step }: { step: BoardStep }) {
  const { n, queens, tones = {} } = step;
  const queenAt = (r: number, c: number) =>
    queens.some((q) => q.r === r && q.c === c);

  return (
    <div className="mx-auto w-fit overflow-hidden rounded-xl border border-line">
      {Array.from({ length: n }, (_, r) => (
        <div key={r} className="flex">
          {Array.from({ length: n }, (_, c) => {
            const tone = tones[`${r},${c}`];
            const dark = (r + c) % 2 === 1;
            return (
              <div
                key={c}
                className={cn(
                  "flex size-11 items-center justify-center text-xl transition-colors duration-200 sm:size-12",
                  tone
                    ? CELL_TONE[tone]
                    : dark
                      ? "bg-surface-3"
                      : "bg-surface-2",
                )}
              >
                {queenAt(r, c) ? "♛" : tone === "bad" ? "✕" : ""}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/* ── Subsets: take-it-or-leave-it decisions + collected results ───────── */

export function SubsetsCanvas({ step }: { step: SubsetStep }) {
  const { values, marks, depth, results } = step;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4">
      <div className="flex items-end gap-2">
        {values.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span
              className={cn(
                "font-mono text-[10px]",
                marks[i] === "in"
                  ? "text-emerald-300"
                  : marks[i] === "out"
                    ? "text-rose-300"
                    : "text-faint",
              )}
            >
              {marks[i] === "in" ? "YES" : marks[i] === "out" ? "NO" : "?"}
            </span>
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-lg border font-mono text-sm transition-all duration-200",
                marks[i] === "in"
                  ? CELL_TONE.good
                  : marks[i] === "out"
                    ? "border-line bg-surface-2 text-faint line-through opacity-60"
                    : CELL_TONE.idle,
                depth === i && "ring-2 ring-brand-500",
              )}
            >
              {v}
            </div>
          </div>
        ))}
      </div>

      <div className="flex w-full flex-col gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wide text-faint">
          subsets found ({results.length})
        </span>
        <div className="flex min-h-8 flex-wrap gap-1.5">
          {results.length === 0 && (
            <span className="text-xs text-faint">(none yet — reach the end of the decisions first)</span>
          )}
          {results.map((r, i) => (
            <span
              key={i}
              className={cn(
                "rounded-md border px-1.5 py-0.5 font-mono text-[11px]",
                i === results.length - 1 ? CELL_TONE.good : CELL_TONE.idle,
              )}
            >
              {r}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
