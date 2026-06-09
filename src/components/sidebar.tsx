"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Binary,
  Boxes,
  Cpu,
  FolderGit2,
  GraduationCap,
  LayoutDashboard,
  MessagesSquare,
  Network,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { useProgress } from "@/components/progress-provider";
import type { NavSection } from "@/lib/content";

const ICONS: Record<string, LucideIcon> = {
  FolderGit2,
  Network,
  Boxes,
  Binary,
  Cpu,
  MessagesSquare,
  ScrollText,
};

function StatusDot({ status }: { status?: "reviewed" | "mastered" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "size-1.5 shrink-0 rounded-full",
        status === "mastered"
          ? "bg-emerald-400"
          : status === "reviewed"
            ? "bg-amber-400"
            : "bg-line",
      )}
    />
  );
}

export function Sidebar({
  nav,
  onNavigate,
}: {
  nav: NavSection[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { getDoc, countFor, mounted } = useProgress();

  return (
    <nav className="flex h-full flex-col">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-2.5 px-5 py-5"
      >
        <span className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 text-white shadow-glow">
          <GraduationCap className="size-5" />
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-ink">
          PrepDeck
        </span>
      </Link>

      <div className="no-scrollbar flex-1 overflow-y-auto px-3 pb-10">
        <Link
          href="/"
          onClick={onNavigate}
          className={cn(
            "mb-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/"
              ? "bg-surface-3 text-ink"
              : "text-subtle hover:bg-surface-2 hover:text-ink",
          )}
        >
          <LayoutDashboard className="size-4" />
          Dashboard
        </Link>

        {nav.map((section) => {
          const Icon = ICONS[section.icon] ?? Boxes;
          const hrefs = section.docs.map((d) => d.href);
          const { reviewed, mastered } = countFor(hrefs);
          const done = reviewed + mastered;
          return (
            <div key={section.id} className="mt-5">
              <div className="flex items-center gap-2 px-3 pb-1.5">
                <Icon
                  className="size-3.5"
                  style={{ color: section.accent }}
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-faint">
                  {section.label}
                </span>
                {mounted && done > 0 && (
                  <span className="ml-auto text-[10px] tabular-nums text-faint">
                    {done}/{section.docs.length}
                  </span>
                )}
              </div>
              <ul>
                {section.docs.map((doc) => {
                  const active = pathname === doc.href;
                  return (
                    <li key={doc.href}>
                      <Link
                        href={doc.href}
                        onClick={onNavigate}
                        className={cn(
                          "flex items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] transition-colors",
                          active
                            ? "bg-surface-3 font-medium text-ink"
                            : "text-subtle hover:bg-surface-2 hover:text-ink",
                        )}
                      >
                        <StatusDot
                          status={mounted ? getDoc(doc.href) : undefined}
                        />
                        <span className="truncate">{doc.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
