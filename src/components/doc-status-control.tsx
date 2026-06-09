"use client";

import { Check, CheckCheck, Circle } from "lucide-react";
import { cn } from "@/lib/cn";
import { useProgress } from "@/components/progress-provider";

/** Cycles a doc through none → reviewed → mastered → none. */
export function DocStatusControl({ href }: { href: string }) {
  const { getDoc, cycleDoc, mounted } = useProgress();
  const status = mounted ? getDoc(href) : undefined;

  const label =
    status === "mastered"
      ? "Mastered"
      : status === "reviewed"
        ? "Reviewed"
        : "Mark as reviewed";
  const Icon =
    status === "mastered" ? CheckCheck : status === "reviewed" ? Check : Circle;

  return (
    <button
      type="button"
      onClick={() => cycleDoc(href)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        status === "mastered"
          ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300"
          : status === "reviewed"
            ? "border-amber-500/50 bg-amber-500/15 text-amber-300"
            : "border-line text-subtle hover:border-line-strong hover:text-ink",
      )}
      title="Click to cycle: reviewed → mastered → clear"
    >
      <Icon className="size-3.5" />
      {label}
    </button>
  );
}
