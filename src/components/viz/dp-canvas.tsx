"use client";

import { cn } from "@/lib/cn";
import type { DpStep } from "@/lib/viz/types";
import { CELL_TONE } from "./tones";

/**
 * Renders a DP table (also used for prefix sums and Fenwick trees):
 * optional column headers on top, row labels on the left, toned cells.
 */
export function DpCanvas({ step }: { step: DpStep }) {
  const { grid, rowLabels, colLabels, tones = {} } = step;
  const cols = Math.max(...grid.map((r) => r.length));

  return (
    <div className="mx-auto w-fit">
      <div
        className="grid gap-1"
        style={{
          gridTemplateColumns: `${rowLabels ? "auto " : ""}repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {colLabels && (
          <>
            {rowLabels && <span />}
            {colLabels.map((c, j) => (
              <span
                key={`c${j}`}
                className="flex h-6 min-w-8 items-center justify-center font-mono text-[10px] text-faint"
              >
                {c}
              </span>
            ))}
          </>
        )}
        {grid.map((row, r) => (
          <Row key={r} r={r} row={row} cols={cols} label={rowLabels?.[r]} tones={tones} />
        ))}
      </div>
    </div>
  );
}

function Row({
  r,
  row,
  cols,
  label,
  tones,
}: {
  r: number;
  row: (number | string | null)[];
  cols: number;
  label?: string;
  tones: NonNullable<DpStep["tones"]>;
}) {
  return (
    <>
      {label !== undefined && (
        <span className="flex h-9 items-center justify-end pr-1.5 font-mono text-[11px] text-subtle">
          {label}
        </span>
      )}
      {Array.from({ length: cols }, (_, c) => {
        const v = row[c];
        const tone = tones[`${r},${c}`];
        return (
          <div
            key={c}
            className={cn(
              "flex h-9 min-w-8 items-center justify-center rounded-md border px-1 font-mono text-xs transition-colors duration-200",
              v === null || v === undefined || v === ""
                ? "border-dashed border-line bg-transparent text-faint"
                : CELL_TONE[tone ?? "idle"],
            )}
          >
            {v === null || v === undefined ? "" : v}
          </div>
        );
      })}
    </>
  );
}
