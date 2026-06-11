"use client";

import { cn } from "@/lib/cn";
import type { MatchStep } from "@/lib/viz/types";
import { CELL_TONE } from "./tones";

const cellCls =
  "flex h-8 w-7 shrink-0 items-center justify-center rounded-md border font-mono text-xs transition-colors duration-150";

/**
 * String matching: the text on top, the pattern slid underneath it at
 * `offset`, and (for KMP) the failure table under the pattern.
 */
export function MatchCanvas({ step }: { step: MatchStep }) {
  const { text, pattern, offset, textTones = {}, patTones = {}, lps } = step;

  return (
    <div className="mx-auto w-fit">
      <div className="flex flex-col gap-1">
        {/* index ruler */}
        <div className="flex gap-1 pl-16">
          {text.split("").map((_, i) => (
            <span key={i} className="flex w-7 shrink-0 justify-center font-mono text-[9px] text-faint">
              {i}
            </span>
          ))}
        </div>

        {/* text row */}
        <div className="flex items-center gap-1">
          <span className="w-15 shrink-0 text-right font-mono text-[10px] text-faint">text</span>
          {text.split("").map((ch, i) => (
            <div key={i} className={cn(cellCls, CELL_TONE[textTones[i] ?? "idle"])}>
              {ch}
            </div>
          ))}
        </div>

        {/* pattern row, shifted by offset */}
        <div className="flex items-center gap-1">
          <span className="w-15 shrink-0 text-right font-mono text-[10px] text-faint">pattern</span>
          {Array.from({ length: offset }, (_, i) => (
            <span key={`sp${i}`} className="w-7 shrink-0" />
          ))}
          {pattern.split("").map((ch, i) => (
            <div key={i} className={cn(cellCls, CELL_TONE[patTones[i] ?? "focus"], !patTones[i] && "border-line bg-surface-3 text-subtle")}>
              {ch}
            </div>
          ))}
        </div>

        {/* failure table (KMP) */}
        {lps && (
          <div className="flex items-center gap-1">
            <span className="w-15 shrink-0 text-right font-mono text-[10px] text-faint">survives</span>
            {Array.from({ length: offset }, (_, i) => (
              <span key={`sl${i}`} className="w-7 shrink-0" />
            ))}
            {lps.map((v, i) => (
              <div
                key={i}
                className={cn(
                  cellCls,
                  "h-7",
                  v === null
                    ? "border-dashed border-line text-faint"
                    : "border-line bg-surface-2 text-amber-300/90",
                )}
              >
                {v ?? ""}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
