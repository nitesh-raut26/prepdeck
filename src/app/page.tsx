import Link from "next/link";
import { ArrowRight, Command, Map, Sparkles } from "lucide-react";
import { DashboardGrid } from "@/components/dashboard-grid";
import { getNav } from "@/lib/content";

export default function HomePage() {
  const nav = getNav();

  return (
    <div>
      <div className="mb-9">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1 text-xs text-subtle">
          <Sparkles className="size-3.5 text-brand-400" />
          Zero → Offer learning path
        </div>
        <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
          From your first line of code to the offer call.
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-subtle">
          A thirteen-level path — computer basics, programming, DSA, LLD, HLD,
          backend, frontend, databases, cloud, AI and career — grounded in real
          projects: LandAI, StockVision, StockStump and Praxivo. Read it, mark
          what you know, and revise fast. Press{" "}
          <kbd className="rounded border border-line bg-surface-3 px-1.5 py-0.5 font-mono text-[11px]">
            ⌘K
          </kbd>{" "}
          to search anything.
        </p>
        <Link
          href="/roadmap"
          className="group mt-5 inline-flex items-center gap-2 rounded-xl border border-line bg-surface-1 px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-2"
        >
          <Map className="size-4 text-brand-400" />
          View the Level 0 → 12 roadmap
          <ArrowRight className="size-4 text-faint transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <DashboardGrid nav={nav} />

      <div className="mt-10 rounded-2xl border border-line bg-surface-1 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <Command className="size-4 text-brand-400" />
          How to use this
        </div>
        <ul className="mt-3 space-y-2 text-sm text-subtle">
          <li>
            <strong className="text-ink">New to coding? Start at Level 0.</strong>{" "}
            The Basics section assumes nothing — follow the roadmap upward from
            there.
          </li>
          <li>
            <strong className="text-ink">Interviewing? Start with Projects.</strong>{" "}
            The “tell me about a project” question opens most loops — own these
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
