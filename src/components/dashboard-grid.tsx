"use client";

import Link from "next/link";
import {
  Binary,
  Boxes,
  BrainCircuit,
  Briefcase,
  Cloud,
  Code2,
  Cpu,
  Database,
  FolderGit2,
  Laptop,
  MessagesSquare,
  Network,
  PanelsTopLeft,
  ScrollText,
  Server,
  type LucideIcon,
} from "lucide-react";
import { useProgress } from "@/components/progress-provider";
import type { NavSection } from "@/lib/content";

const ICONS: Record<string, LucideIcon> = {
  Laptop,
  Code2,
  Binary,
  Boxes,
  Network,
  Server,
  PanelsTopLeft,
  Database,
  Cloud,
  BrainCircuit,
  Cpu,
  FolderGit2,
  MessagesSquare,
  Briefcase,
  ScrollText,
};

export function DashboardGrid({ nav }: { nav: NavSection[] }) {
  const { countFor, mounted } = useProgress();

  const allHrefs = nav.flatMap((s) => s.docs.map((d) => d.href));
  const total = allHrefs.length;
  const { reviewed, mastered } = countFor(allHrefs);
  const done = reviewed + mastered;
  const pct = total ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      {/* Overall progress */}
      <div className="mb-8 rounded-2xl border border-line bg-surface-1 p-5">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-sm font-medium text-subtle">
              Overall progress
            </div>
            <div className="mt-1 text-3xl font-semibold tracking-tight text-ink">
              {mounted ? pct : 0}
              <span className="text-lg text-faint">%</span>
            </div>
          </div>
          <div className="text-right text-xs text-faint">
            <div>
              <span className="text-amber-400">{mounted ? reviewed : 0}</span>{" "}
              reviewed
            </div>
            <div>
              <span className="text-emerald-400">
                {mounted ? mastered : 0}
              </span>{" "}
              mastered
            </div>
            <div>{total} topics total</div>
          </div>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-500 transition-all"
            style={{ width: `${mounted ? pct : 0}%` }}
          />
        </div>
      </div>

      {/* Section cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {nav.map((section) => {
          const Icon = ICONS[section.icon] ?? Boxes;
          const hrefs = section.docs.map((d) => d.href);
          const c = countFor(hrefs);
          const secDone = c.reviewed + c.mastered;
          const secPct = hrefs.length
            ? Math.round((secDone / hrefs.length) * 100)
            : 0;
          return (
            <Link
              key={section.id}
              href={`/${section.id}`}
              className="group rounded-2xl border border-line bg-surface-1 p-5 transition-colors hover:border-line-strong hover:bg-surface-2"
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid size-9 place-items-center rounded-lg"
                  style={{
                    backgroundColor: `${section.accent}1a`,
                    color: section.accent,
                  }}
                >
                  <Icon className="size-5" />
                </span>
                <div className="font-semibold text-ink">{section.title}</div>
                <span className="ml-auto text-xs text-faint">
                  {section.docs.length}
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-subtle">
                {section.blurb}
              </p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-3">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${mounted ? secPct : 0}%`,
                    backgroundColor: section.accent,
                  }}
                />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
