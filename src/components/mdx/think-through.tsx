"use client";

import { useState } from "react";
import { CheckCircle2, Eye, Lightbulb, Lock, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";

export type ThinkStage = {
  /** Short stage name, e.g. "Spot the pattern". */
  label: string;
  /** The question YOU should be asking yourself at this stage. */
  prompt: string;
  /** The thinking, revealed on demand. */
  reveal: string;
  /** Optional code shown with the reveal. */
  code?: string;
};

/**
 * Guided problem walkthrough. The problem is shown; the thinking stages are
 * locked behind "show me" buttons so the reader is nudged to actually think
 * before peeking — the same muscle they'll need in the interview room.
 *
 * Usage in MDX:
 *   <ThinkThrough
 *     title="Two Sum"
 *     difficulty="Easy"
 *     problem="Given an array and a target, return indices of two numbers adding to target."
 *     stages={[{ label, prompt, reveal, code? }, …]}
 *   />
 */
export function ThinkThrough({
  title,
  difficulty,
  problem,
  stages,
}: {
  title: string;
  difficulty?: string;
  problem: string;
  stages: ThinkStage[];
}) {
  const [revealed, setRevealed] = useState(0);

  return (
    <div className="not-prose my-6 overflow-hidden rounded-2xl border border-line bg-surface-1">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-2 px-4 py-2.5">
        <span className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Lightbulb className="size-4 text-amber-300" />
          Think it through: {title}
        </span>
        <span className="flex items-center gap-2">
          {difficulty && (
            <span className="rounded-md border border-line bg-surface-3 px-1.5 py-0.5 text-[11px] text-subtle">
              {difficulty}
            </span>
          )}
          <span className="font-mono text-[11px] text-faint">
            {revealed}/{stages.length} stages
          </span>
        </span>
      </div>

      <div className="border-b border-line px-4 py-3">
        <p className="text-[13px] leading-relaxed text-subtle">
          <span className="mr-1.5 rounded bg-brand-600/20 px-1.5 py-0.5 text-[11px] font-semibold text-brand-300">
            PROBLEM
          </span>
          {problem}
        </p>
      </div>

      <ol className="divide-y divide-line">
        {stages.map((st, i) => {
          const isOpen = i < revealed;
          const isNext = i === revealed;
          return (
            <li key={i} className={cn("px-4 py-3.5", !isOpen && !isNext && "opacity-45")}>
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px]",
                    isOpen
                      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                      : isNext
                        ? "border-brand-500/60 bg-brand-600/15 text-brand-300"
                        : "border-line text-faint",
                  )}
                >
                  {isOpen ? <CheckCircle2 className="size-3.5" /> : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{st.label}</p>
                  <p className="mt-0.5 text-[13px] italic leading-relaxed text-subtle">
                    “{st.prompt}”
                  </p>

                  {isOpen && (
                    <div className="mt-2.5 rounded-lg border border-line bg-surface-2 px-3 py-2.5">
                      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-subtle">
                        {st.reveal}
                      </p>
                      {st.code && (
                        <pre className="mt-2.5 overflow-x-auto rounded-lg border border-line bg-bg p-3 font-mono text-xs leading-relaxed text-ink">
                          {st.code}
                        </pre>
                      )}
                    </div>
                  )}

                  {isNext && (
                    <button
                      type="button"
                      onClick={() => setRevealed((r) => r + 1)}
                      className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg border border-brand-500/50 bg-brand-600/15 px-3 py-1.5 text-xs font-medium text-brand-300 transition-colors hover:bg-brand-600/25"
                    >
                      <Eye className="size-3.5" />
                      I&rsquo;ve thought about it — show me
                    </button>
                  )}
                  {!isOpen && !isNext && (
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] text-faint">
                      <Lock className="size-3" /> unlocks after the stage above
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      {revealed === stages.length && (
        <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-2/60 px-4 py-3">
          <span className="text-[13px] text-subtle">
            That chain of questions <em>is</em> the method. Next problem: run the
            stages yourself before revealing anything.
          </span>
          <button
            type="button"
            onClick={() => setRevealed(0)}
            className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs text-subtle transition-colors hover:bg-surface-3 hover:text-ink"
          >
            <RotateCcw className="size-3.5" /> Hide again
          </button>
        </div>
      )}
    </div>
  );
}
