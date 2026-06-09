"use client";

import { useState } from "react";
import { Check, ChevronDown, HelpCircle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import { useProgress } from "@/components/progress-provider";

/**
 * Interview-question flashcard. Click to reveal the answer, then self-rate.
 * Usage in MDX:
 *   <QA q="Why httpOnly cookies over localStorage for JWTs?">
 *   Because localStorage is readable by any JS on the page, so an XSS...
 *   </QA>
 */
export function QA({
  q,
  id,
  children,
}: {
  q: string;
  id?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { getCard, setCard, mounted } = useProgress();
  const cardId = id ?? q;
  const status = mounted ? getCard(cardId) : undefined;

  return (
    <div
      className={cn(
        "not-prose my-4 overflow-hidden rounded-xl border bg-surface-2 transition-colors",
        status === "known"
          ? "border-emerald-500/40"
          : status === "review"
            ? "border-amber-500/40"
            : "border-line",
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface-3"
      >
        <HelpCircle className="mt-0.5 size-4 shrink-0 text-brand-400" />
        <span className="flex-1 font-medium text-ink">{q}</span>
        <ChevronDown
          className={cn(
            "mt-0.5 size-4 shrink-0 text-faint transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="border-t border-line px-4 pb-4 pt-3">
          <div className="prose prose-invert max-w-none prose-sm">
            {children}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCard(cardId, status === "known" ? null : "known")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                status === "known"
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
                  : "border-line text-subtle hover:text-ink",
              )}
            >
              <Check className="size-3.5" /> Knew it
            </button>
            <button
              type="button"
              onClick={() =>
                setCard(cardId, status === "review" ? null : "review")
              }
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                status === "review"
                  ? "border-amber-500/50 bg-amber-500/15 text-amber-300"
                  : "border-line text-subtle hover:text-ink",
              )}
            >
              <RotateCcw className="size-3.5" /> Revise again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
