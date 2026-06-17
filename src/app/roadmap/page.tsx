import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Map } from "lucide-react";
import { getSection } from "@/lib/nav";
import { getAllDocParams } from "@/lib/content";
import { ROADMAP } from "@/lib/roadmap";

export const metadata: Metadata = {
  title: "Roadmap",
  description:
    "The Level 0 → 12 learning path: from absolute beginner to offer-ready engineer.",
};

export default function RoadmapPage() {
  const existing = new Set(
    getAllDocParams().map((p) => `${p.section}/${p.slug}`),
  );

  return (
    <div>
      <nav className="mb-4 flex items-center gap-1.5 text-xs text-faint">
        <Link href="/" className="hover:text-subtle">
          Home
        </Link>
        <ChevronRight className="size-3.5" />
        <span className="text-subtle">Roadmap</span>
      </nav>

      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1 text-xs text-subtle">
        <Map className="size-3.5 text-brand-400" />
        Zero → Offer learning path
      </div>
      <h1 className="text-3xl font-semibold tracking-tight text-ink">
        The Roadmap
      </h1>
      <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-subtle">
        Thirteen levels, in reading order. Start wherever your knowledge ends:
        Level 0 assumes you have never written a line of code. Linked topics
        are ready to read; dimmed ones are planned and light up as content
        lands. Projects and cheat sheets run alongside every level.
      </p>

      <ol className="mt-8 space-y-4">
        {[...ROADMAP].sort((a, b) => a.level - b.level).map((lvl) => {
          const primary = getSection(lvl.sections[0]);
          const accent = primary?.accent ?? "#818cf8";
          const ready = lvl.topics.filter(
            (t) => t.doc && existing.has(t.doc),
          ).length;
          return (
            <li
              key={lvl.level}
              className="relative rounded-2xl border border-line bg-surface-1 p-5"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-sm font-bold tabular-nums"
                  style={{ backgroundColor: `${accent}1a`, color: accent }}
                >
                  {lvl.level}
                </span>
                <div className="min-w-0">
                  <div className="font-semibold text-ink">
                    Level {lvl.level} — {lvl.title}
                  </div>
                  <div className="text-xs text-faint">
                    {lvl.sections.map((id, i) => {
                      const s = getSection(id);
                      if (!s) return null;
                      return (
                        <span key={id}>
                          {i > 0 && " · "}
                          <Link
                            href={`/${id}`}
                            className="hover:text-subtle"
                            style={{ color: s.accent }}
                          >
                            {s.label}
                          </Link>
                        </span>
                      );
                    })}
                  </div>
                </div>
                <span className="ml-auto text-xs tabular-nums text-faint">
                  {ready}/{lvl.topics.length} ready
                </span>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-subtle">
                {lvl.goal}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {lvl.topics.map((t) => {
                  const href = t.doc && existing.has(t.doc) ? `/${t.doc}` : null;
                  return href ? (
                    <Link
                      key={t.label}
                      href={href}
                      className="rounded-full border border-line bg-surface-2 px-2.5 py-1 text-xs text-subtle transition-colors hover:border-line-strong hover:text-ink"
                    >
                      {t.label}
                    </Link>
                  ) : (
                    <span
                      key={t.label}
                      className="rounded-full border border-dashed border-line px-2.5 py-1 text-xs text-faint"
                      title="Planned — content coming soon"
                    >
                      {t.label}
                    </span>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
