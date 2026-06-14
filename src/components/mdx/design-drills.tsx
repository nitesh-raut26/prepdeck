"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, PencilRuler, Trophy } from "lucide-react";
import { cn } from "@/lib/cn";

export type DesignDrill = {
  /** The challenge to whiteboard — a variation or follow-up on the page's system. */
  prompt: string;
  /** Free-form tier, e.g. "Warm-up" | "Core" | "Stretch". */
  level?: string;
  /** "What a strong answer covers" — revealed on demand, after attempting. */
  covers: string[];
};

const STORAGE_KEY = "pd-design-drills-v1";

function loadDone(): Record<string, true> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

const LEVEL_STYLE: Record<string, string> = {
  "Warm-up": "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  Core: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  Stretch: "border-rose-500/40 bg-rose-500/10 text-rose-300",
};

/**
 * The system-design counterpart to <PracticeLadder>: there's no LeetCode link
 * to attach, so each "drill" is a design variation/follow-up to whiteboard,
 * with a reveal-on-demand checklist of what a strong answer covers. Attempted
 * state is persisted per device.
 */
export function DesignDrills({
  topic,
  drills,
}: {
  topic: string;
  drills: DesignDrill[];
}) {
  const [done, setDone] = useState<Record<string, true>>({});
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDone(loadDone());
    setMounted(true);
  }, []);

  const ids = useMemo(
    () => drills.map((_, i) => `${topic}::${i}`),
    [topic, drills],
  );
  const completed = mounted ? ids.filter((id) => done[id]).length : 0;
  const pct = ids.length ? Math.round((completed / ids.length) * 100) : 0;

  function toggleDone(id: string) {
    setDone((prev) => {
      const next: Record<string, true> = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = true;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* private mode etc. — best-effort */
      }
      return next;
    });
  }

  function toggleOpen(id: string) {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="not-prose my-7 overflow-hidden rounded-2xl border border-line bg-surface-1">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-2 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-ink">
          <PencilRuler className="size-4 text-brand-400" />
          Design drills: {topic}
        </span>
        <span className="flex items-center gap-2.5">
          <span className="font-mono text-[11px] text-faint">
            {completed}/{ids.length} done
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
        Whiteboard each one out loud for 5–10 minutes <em>before</em> you reveal
        what a strong answer covers — the gap between your sketch and the
        checklist is your study list. Progress is saved on this device.
      </p>

      <div className="divide-y divide-line">
        {drills.map((d, i) => {
          const id = ids[i];
          const isDone = mounted && !!done[id];
          const isOpen = !!open[id];
          return (
            <div key={id} className="px-4 py-3.5">
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={isDone}
                  aria-label={`Mark drill ${i + 1} attempted`}
                  onClick={() => toggleDone(id)}
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
                  {d.level && (
                    <span
                      className={cn(
                        "mb-1.5 inline-block rounded-md border px-1.5 py-px text-[10.5px] font-semibold",
                        LEVEL_STYLE[d.level] ??
                          "border-line bg-surface-3 text-subtle",
                      )}
                    >
                      {d.level}
                    </span>
                  )}
                  <p
                    className={cn(
                      "text-[14px] leading-snug text-ink",
                      isDone && "opacity-70",
                    )}
                  >
                    {d.prompt}
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleOpen(id)}
                    aria-expanded={isOpen}
                    className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-medium text-brand-300 hover:text-brand-200"
                  >
                    <ChevronDown
                      className={cn(
                        "size-3.5 transition-transform",
                        isOpen ? "" : "-rotate-90",
                      )}
                    />
                    {isOpen ? "Hide" : "Reveal"} what a strong answer covers
                  </button>
                  {isOpen && (
                    <ul className="mt-2 space-y-1.5 border-l-2 border-line pl-3.5">
                      {d.covers.map((c, j) => (
                        <li
                          key={j}
                          className="text-[13px] leading-relaxed text-subtle"
                        >
                          {c}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {mounted && completed === ids.length && ids.length > 0 && (
        <div className="flex items-center gap-2 border-t border-line bg-emerald-500/10 px-4 py-3 text-[13px] text-emerald-300">
          <Trophy className="size-4" />
          All drilled. Re-run the Stretch prompts from a blank page next week —
          design fluency comes from the second pass.
        </div>
      )}
    </div>
  );
}
