"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Brain, Check, ChevronDown, RotateCcw, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import { useProgress } from "@/components/progress-provider";
import type { Flashcard } from "@/lib/content";

/**
 * Spaced-repetition review session. The queue is the set of cards due now
 * (rated on lesson pages via <QA>), optionally topped up with new, never-seen
 * cards. The queue is snapshotted when the session starts so a card rated
 * "revise" (due again in minutes) doesn't loop forever within one session.
 */
export function ReviewDeck({ cards }: { cards: Flashcard[] }) {
  const { mounted, cards: records, rate, dueIds, retentionScore } = useProgress();
  const byId = useMemo(() => new Map(cards.map((c) => [c.id, c])), [cards]);

  const [queue, setQueue] = useState<string[] | null>(null);
  const [pos, setPos] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionStats, setSessionStats] = useState({ knew: 0, revise: 0 });

  if (!mounted) {
    return <div className="h-64 animate-pulse rounded-2xl border border-line bg-surface-1" />;
  }

  const due = dueIds().filter((id) => byId.has(id));
  const seenIds = new Set(Object.keys(records));
  const fresh = cards.filter((c) => !seenIds.has(c.id));
  const tracked = cards.filter((c) => seenIds.has(c.id)).length;
  const ret = retentionScore();

  function start(includeNew: boolean) {
    const ids = [...due];
    if (includeNew) {
      for (const c of fresh.slice(0, 10)) ids.push(c.id);
    }
    setQueue(ids);
    setPos(0);
    setRevealed(false);
    setSessionStats({ knew: 0, revise: 0 });
  }

  function rateCurrent(rating: "knew" | "revise") {
    if (!queue) return;
    rate(queue[pos], rating);
    setSessionStats((s) => ({ ...s, [rating]: s[rating as "knew"] + 1 }));
    setRevealed(false);
    setPos((p) => p + 1);
  }

  /* ── Session in progress ─────────────────────────────────────────── */
  if (queue && pos < queue.length) {
    const card = byId.get(queue[pos])!;
    return (
      <div>
        <SessionHeader pos={pos} total={queue.length} />
        <div className="overflow-hidden rounded-2xl border border-line bg-surface-1">
          <div className="border-b border-line bg-surface-2 px-5 py-3">
            <span className="text-[11px] uppercase tracking-wide text-faint">
              {card.sectionLabel} ·{" "}
              <Link href={card.href} className="underline-offset-2 hover:underline">
                {card.docTitle}
              </Link>
            </span>
          </div>
          <div className="px-5 py-6">
            <p className="text-lg font-medium leading-relaxed text-ink">{card.q}</p>

            {revealed ? (
              <CardAnswer answer={card.answer} />
            ) : (
              <button
                type="button"
                onClick={() => setRevealed(true)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-line-strong py-6 text-sm text-subtle transition-colors hover:border-brand-500/50 hover:text-ink"
              >
                <ChevronDown className="size-4" />
                Reveal answer — recall it first, out loud
              </button>
            )}
          </div>
          {revealed && (
            <div className="flex items-center gap-2 border-t border-line bg-surface-2/60 px-5 py-3.5">
              <button
                type="button"
                onClick={() => rateCurrent("knew")}
                className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/50 bg-emerald-500/15 px-4 py-1.5 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/25"
              >
                <Check className="size-4" /> Knew it
              </button>
              <button
                type="button"
                onClick={() => rateCurrent("revise")}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/50 bg-amber-500/15 px-4 py-1.5 text-sm font-medium text-amber-300 transition-colors hover:bg-amber-500/25"
              >
                <RotateCcw className="size-4" /> Revise again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ── Session finished ────────────────────────────────────────────── */
  if (queue && queue.length > 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface-1 px-6 py-10 text-center">
        <Sparkles className="mx-auto size-8 text-brand-400" />
        <h2 className="mt-3 text-xl font-semibold text-ink">Session complete</h2>
        <p className="mt-2 text-sm text-subtle">
          {queue.length} card{queue.length === 1 ? "" : "s"} reviewed —{" "}
          <span className="text-emerald-300">{sessionStats.knew} recalled</span>,{" "}
          <span className="text-amber-300">{sessionStats.revise} to revise</span>.
          Cards you knew come back later; cards you missed return within minutes.
        </p>
        <button
          type="button"
          onClick={() => setQueue(null)}
          className="mt-6 rounded-lg border border-line px-4 py-2 text-sm text-subtle transition-colors hover:bg-surface-3 hover:text-ink"
        >
          Back to overview
        </button>
      </div>
    );
  }

  /* ── Overview / start screen ─────────────────────────────────────── */
  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label="due now" value={due.length} highlight={due.length > 0} />
        <Stat label="tracked cards" value={tracked} />
        <Stat label="card bank" value={cards.length} />
        <Stat label="retention" value={ret === null ? "—" : `${ret}%`} />
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface-1 px-6 py-8 text-center">
        <Brain className="mx-auto size-8 text-brand-400" />
        {due.length > 0 ? (
          <>
            <h2 className="mt-3 text-lg font-semibold text-ink">
              {due.length} card{due.length === 1 ? "" : "s"} due for review
            </h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-subtle">
              These are questions you rated on lesson pages, scheduled back at
              growing intervals (1 → 3 → 7 → 14 → 30 → 60 → 90 days).
            </p>
          </>
        ) : (
          <>
            <h2 className="mt-3 text-lg font-semibold text-ink">Nothing due right now</h2>
            <p className="mx-auto mt-1.5 max-w-md text-sm text-subtle">
              {tracked === 0
                ? "Rate flashcards on any lesson page (“Knew it” / “Revise again”) and they’ll show up here on a spaced-repetition schedule."
                : "All caught up. Come back when the next interval lands — or pull in cards you haven’t seen yet."}
            </p>
          </>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {due.length > 0 && (
            <button
              type="button"
              onClick={() => start(false)}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500"
            >
              Review {due.length} due card{due.length === 1 ? "" : "s"}
            </button>
          )}
          {fresh.length > 0 && (
            <button
              type="button"
              onClick={() => start(true)}
              className="rounded-lg border border-line px-4 py-2 text-sm text-subtle transition-colors hover:bg-surface-3 hover:text-ink"
            >
              {due.length > 0
                ? "Due + 10 new cards"
                : `Learn ${Math.min(10, fresh.length)} new cards`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionHeader({ pos, total }: { pos: number; total: number }) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between text-xs text-faint">
        <span>
          Card {pos + 1} of {total}
        </span>
        <span>{Math.round((pos / total) * 100)}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-3">
        <div
          className="h-full rounded-full bg-brand-500 transition-all"
          style={{ width: `${(pos / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-surface-1 px-4 py-3",
        highlight ? "border-brand-500/50" : "border-line",
      )}
    >
      <div className={cn("text-2xl font-semibold", highlight ? "text-brand-300" : "text-ink")}>
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wide text-faint">{label}</div>
    </div>
  );
}

/**
 * Renders the QA block's inner MDX as readable plain content: fenced code
 * becomes <pre>, the rest is de-markdown-ified text. (Full MDX rendering of
 * 400 cards client-side isn't worth the bundle — the source lesson is one
 * click away.)
 */
function CardAnswer({ answer }: { answer: string }) {
  const parts = answer.split(/```(\w*)\n?/);
  // split yields [text, lang, code, text, lang, code, ...]
  const blocks: { kind: "text" | "code"; body: string }[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (i % 3 === 0) {
      const t = cleanMd(parts[i]);
      if (t) blocks.push({ kind: "text", body: t });
    } else if (i % 3 === 2) {
      blocks.push({ kind: "code", body: parts[i].replace(/\n$/, "") });
    }
  }
  return (
    <div className="mt-5 border-t border-line pt-4">
      {blocks.map((b, i) =>
        b.kind === "code" ? (
          <pre
            key={i}
            className="my-3 overflow-x-auto rounded-xl border border-line bg-surface-2 p-3 font-mono text-xs leading-relaxed text-ink"
          >
            {b.body}
          </pre>
        ) : (
          <p key={i} className="my-2 whitespace-pre-wrap text-sm leading-relaxed text-subtle">
            {b.body}
          </p>
        ),
      )}
    </div>
  );
}

function cleanMd(s: string): string {
  return s
    .replace(/<[^>]+>/g, "") // nested JSX/HTML tags
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^[-*]\s+/gm, "• ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
