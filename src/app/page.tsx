import { Command, Sparkles } from "lucide-react";
import { DashboardGrid } from "@/components/dashboard-grid";
import { getNav } from "@/lib/content";

export default function HomePage() {
  const nav = getNav();

  return (
    <div>
      <div className="mb-9">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1 text-xs text-subtle">
          <Sparkles className="size-3.5 text-brand-400" />
          SDE2 interview prep
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          Everything you need, organized for the room.
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-subtle">
          Your projects — LandAI, StockVision, StockStump and Praxivo — turned
          into interview-ready material across system design, low-level design,
          DSA, fundamentals and behavioral. Read it, mark what you know, and
          revise fast. Press{" "}
          <kbd className="rounded border border-line bg-surface-3 px-1.5 py-0.5 font-mono text-[11px]">
            ⌘K
          </kbd>{" "}
          to search anything.
        </p>
      </div>

      <DashboardGrid nav={nav} />

      <div className="mt-10 rounded-2xl border border-line bg-surface-1 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Command className="size-4 text-brand-400" />
          How to use this
        </div>
        <ul className="mt-3 space-y-2 text-sm text-subtle">
          <li>
            <strong className="text-ink">Start with Projects.</strong> The
            “tell me about a project” question opens most loops — own these
            cold.
          </li>
          <li>
            <strong className="text-ink">Reveal &amp; self-rate.</strong>{" "}
            Interview questions are flashcards: click to reveal, then mark “Knew
            it” or “Revise again”.
          </li>
          <li>
            <strong className="text-ink">Track progress.</strong> Mark each
            topic <em>reviewed</em> → <em>mastered</em>; the sidebar and
            dashboard remember it (stored locally in your browser).
          </li>
        </ul>
      </div>
    </div>
  );
}
