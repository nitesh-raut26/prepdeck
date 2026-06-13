"use client";

import { cn } from "@/lib/cn";
import type { SplitStep } from "@/lib/viz/types";
import { CELL_TONE } from "./tones";

const fmt = (n: number) => (n > 0 ? `+${n}` : `${n}`);

/** Net-balance chips up top, the minimal settlement transfers building below. */
export function SplitCanvas({ step }: { step: SplitStep }) {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      <div>
        <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wide text-faint">
          net balances
        </span>
        <div className="flex flex-wrap gap-2">
          {step.people.map((p) => {
            const settled = Math.abs(p.balance) < 1e-9;
            return (
              <div
                key={p.id}
                className={cn(
                  "flex min-w-[3.5rem] flex-col items-center rounded-lg border px-2.5 py-1.5 font-mono transition-colors",
                  p.tone
                    ? CELL_TONE[p.tone]
                    : settled
                      ? "border-line bg-surface-2 text-faint opacity-60"
                      : p.balance > 0
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                        : "border-rose-500/40 bg-rose-500/10 text-rose-300",
                )}
              >
                <span className="text-[13px] font-bold leading-none">{p.id}</span>
                <span className="mt-0.5 text-[12px] leading-none">
                  {settled ? "✓ 0" : fmt(p.balance)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wide text-faint">
          settlement transfers
          {step.settlements.length > 0 && (
            <span className="ml-1.5 normal-case tracking-normal text-subtle">
              {step.settlements.length} vs {step.rawCount} raw
            </span>
          )}
        </span>
        <div className="flex min-h-[2.5rem] flex-col gap-1 rounded-xl border border-dashed border-line-strong p-2">
          {step.settlements.length === 0 && (
            <span className="px-1 text-xs text-faint">
              (none yet — collapsing the IOUs first)
            </span>
          )}
          {step.settlements.map((s, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 font-mono text-[12.5px] text-ink"
            >
              <span className="text-rose-300">{s.from}</span>
              <span className="text-faint">pays</span>
              <span className="text-emerald-300">{s.to}</span>
              <span className="ml-auto rounded-md border border-line bg-surface-3 px-1.5 text-[11px] text-subtle">
                {s.amount}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
