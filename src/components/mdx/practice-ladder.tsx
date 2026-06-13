"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ExternalLink, Target, Trophy } from "lucide-react";
import { cn } from "@/lib/cn";

export type LadderProblem = {
  /** Display name, e.g. "Two Sum". */
  name: string;
  /** LeetCode slug, e.g. "two-sum" → https://leetcode.com/problems/two-sum/ */
  lc: string;
  difficulty: "Easy" | "Medium" | "Hard";
  /** One line: the specific skill this problem trains. */
  trains: string;
};

export type LadderTier = {
  /** "Warm-up" | "Core" | "Stretch" (free-form). */
  label: string;
  /** Short coaching line shown next to the tier label. */
  note?: string;
  problems: LadderProblem[];
};

const STORAGE_KEY = "pd-practice-v1";

function loadSolved(): Record<string, true> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

const DIFF_STYLE: Record<LadderProblem["difficulty"], string> = {
  Easy: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  Medium: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  Hard: "border-rose-500/40 bg-rose-500/10 text-rose-300",
};

/**
 * Tiered practice list with LeetCode links and locally-persisted progress.
 * Concept first, then problems — each tier assumes the one above it.
 *
 * Usage in MDX:
 *   <PracticeLadder
 *     topic="Arrays"
 *     tiers={[{ label: "Warm-up", problems: [{ name, lc, difficulty, trains }] }, …]}
 *   />
 */
export function PracticeLadder({
  topic,
  tiers,
}: {
  topic: string;
  tiers: LadderTier[];
}) {
  const [solved, setSolved] = useState<Record<string, true>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setSolved(loadSolved());
    setMounted(true);
  }, []);

  const all = useMemo(() => tiers.flatMap((t) => t.problems), [tiers]);
  const done = mounted ? all.filter((p) => solved[p.lc]).length : 0;
  const pct = all.length ? Math.round((done / all.length) * 100) : 0;

  function toggle(lc: string) {
    setSolved((prev) => {
      const next: Record<string, true> = { ...prev };
      if (next[lc]) delete next[lc];
      else next[lc] = true;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* private mode etc. — tracking is best-effort */
      }
      return next;
    });
  }

  return (
    <div className="not-prose my-7 overflow-hidden rounded-2xl border border-line bg-surface-1">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-2 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Target className="size-4 text-brand-400" />
          Practice ladder: {topic}
        </span>
        <span className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] text-faint">
            {done}/{all.length} solved
          </span>
          <span className="h-1.5 w-24 overflow-hidden rounded-full bg-surface-3">
            <span
              className="block h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </span>
        </span>
      </div>

      <p className="border-b border-line px-4 py-2.5 text-[12.5px] leading-relaxed text-faint">
        Climb in order — every rung assumes the one above it. Solve on LeetCode,
        then tick it here; progress is saved on this device.
      </p>

      <div className="divide-y divide-line">
        {tiers.map((tier) => (
          <section key={tier.label} className="px-4 py-3.5">
            <header className="mb-2.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.08em] text-brand-300">
                {tier.label}
              </h4>
              {tier.note && (
                <span className="text-[12px] italic text-faint">{tier.note}</span>
              )}
            </header>
            <ol className="space-y-1">
              {tier.problems.map((p) => {
                const isDone = mounted && !!solved[p.lc];
                return (
                  <li key={p.lc}>
                    <div
                      className={cn(
                        "group flex items-start gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-surface-2",
                        isDone && "opacity-70",
                      )}
                    >
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={isDone}
                        aria-label={`Mark ${p.name} solved`}
                        onClick={() => toggle(p.lc)}
                        className={cn(
                          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                          isDone
                            ? "border-emerald-500/60 bg-emerald-500/25 text-emerald-300"
                            : "border-line-strong bg-surface-1 text-transparent hover:border-brand-500",
                        )}
                      >
                        <Check className="size-3.5" strokeWidth={3} />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <a
                            href={`https://leetcode.com/problems/${p.lc}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "inline-flex items-center gap-1 text-[13.5px] font-medium text-ink underline-offset-2 hover:text-brand-300 hover:underline",
                              isDone && "line-through decoration-faint",
                            )}
                          >
                            {p.name}
                            <ExternalLink className="size-3 text-faint transition-colors group-hover:text-brand-300" />
                          </a>
                          <span
                            className={cn(
                              "rounded-md border px-1.5 py-px text-[10.5px] font-semibold",
                              DIFF_STYLE[p.difficulty],
                            )}
                          >
                            {p.difficulty}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[12.5px] leading-snug text-subtle">
                          {p.trains}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>

      {mounted && done === all.length && all.length > 0 && (
        <div className="flex items-center gap-2 border-t border-line bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-300">
          <Trophy className="size-4" />
          Ladder complete. Re-solve the Stretch tier from a blank editor next
          week — retention lives in the second solve.
        </div>
      )}
    </div>
  );
}
