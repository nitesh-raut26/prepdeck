"use client";

import { useEffect, useId, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Binary,
  Boxes,
  BrainCircuit,
  Briefcase,
  ChevronDown,
  Cloud,
  Code2,
  Cpu,
  Database,
  FolderGit2,
  GraduationCap,
  Laptop,
  LayoutDashboard,
  Map,
  MessagesSquare,
  Network,
  PanelsTopLeft,
  ScrollText,
  Server,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
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

const SECTIONS_KEY = "pd-sidebar-sections-v1";

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
  // Unique per Sidebar instance so the desktop + mobile-drawer copies don't
  // emit duplicate panel ids (which would break aria-controls).
  const uid = useId();

  // The section that owns the current route, e.g. "/dsa/arrays" → "dsa".
  const activeSection = pathname.split("/")[1] ?? "";

  // Per-section expand/collapse, persisted so the chosen layout sticks.
  // Default (no stored choice): only the active section is open; the rest
  // collapse into clean dropdown headers you click to reveal.
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SECTIONS_KEY);
      if (raw) setOpenMap(JSON.parse(raw));
    } catch {
      /* best-effort */
    }
  }, []);

  function isOpen(id: string) {
    return openMap[id] ?? id === activeSection;
  }

  function toggleSection(id: string) {
    setOpenMap((prev) => {
      const next = { ...prev, [id]: !(prev[id] ?? id === activeSection) };
      try {
        localStorage.setItem(SECTIONS_KEY, JSON.stringify(next));
      } catch {
        /* best-effort */
      }
      return next;
    });
  }

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
        <Link
          href="/roadmap"
          onClick={onNavigate}
          className={cn(
            "mb-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/roadmap"
              ? "bg-surface-3 text-ink"
              : "text-subtle hover:bg-surface-2 hover:text-ink",
          )}
        >
          <Map className="size-4" />
          Roadmap
        </Link>

        {nav.map((section) => {
          const Icon = ICONS[section.icon] ?? Boxes;
          const hrefs = section.docs.map((d) => d.href);
          const { reviewed, mastered } = countFor(hrefs);
          const done = reviewed + mastered;
          const expanded = isOpen(section.id);
          const panelId = `sidebar-section-${uid}-${section.id}`;
          return (
            <div key={section.id} className="mt-4">
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                aria-expanded={expanded}
                aria-controls={panelId}
                className="group flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left transition-colors hover:bg-surface-2"
              >
                <Icon
                  className="size-3.5 shrink-0"
                  style={{ color: section.accent }}
                />
                <span className="text-xs font-semibold uppercase tracking-wider text-faint transition-colors group-hover:text-subtle">
                  {section.label}
                </span>
                {mounted && done > 0 && (
                  <span className="ml-auto text-[10px] tabular-nums text-faint">
                    {done}/{section.docs.length}
                  </span>
                )}
                <ChevronDown
                  aria-hidden
                  className={cn(
                    "size-3.5 shrink-0 text-faint transition-transform duration-200 group-hover:text-subtle",
                    expanded ? "" : "-rotate-90",
                    mounted && done > 0 ? "ml-1.5" : "ml-auto",
                  )}
                />
              </button>
              <div
                id={panelId}
                inert={expanded ? undefined : true}
                className={cn(
                  "grid transition-[grid-template-rows] duration-200 ease-out",
                  expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                )}
              >
                <ul className="overflow-hidden">
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
            </div>
          );
        })}
      </div>
    </nav>
  );
}
