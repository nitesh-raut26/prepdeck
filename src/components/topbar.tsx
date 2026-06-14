"use client";

import Link from "next/link";
import { Brain, Menu, PanelLeftClose, PanelLeftOpen, Search } from "lucide-react";
import { useProgress } from "@/components/progress-provider";

export function Topbar({
  onMenu,
  onSearch,
  languageSwitcher,
  collapsed,
  onToggleCollapsed,
}: {
  onMenu: () => void;
  onSearch: () => void;
  languageSwitcher?: React.ReactNode;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
}) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-surface-1/80 px-4 backdrop-blur-md lg:px-6">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open navigation"
        className="rounded-lg p-2 text-subtle hover:bg-surface-2 hover:text-ink lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      {onToggleCollapsed && (
        <button
          type="button"
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={`${collapsed ? "Expand" : "Collapse"} sidebar (⌘B)`}
          className="hidden rounded-lg p-2 text-subtle transition-colors hover:bg-surface-2 hover:text-ink lg:block"
        >
          {collapsed ? (
            <PanelLeftOpen className="size-[18px]" />
          ) : (
            <PanelLeftClose className="size-[18px]" />
          )}
        </button>
      )}

      <button
        type="button"
        onClick={onSearch}
        className="group flex h-9 flex-1 items-center gap-2 rounded-lg border border-line bg-surface-2 px-3 text-sm text-faint transition-colors hover:border-line-strong hover:text-subtle sm:max-w-xs"
      >
        <Search className="size-4" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="hidden rounded border border-line bg-surface-3 px-1.5 py-0.5 font-mono text-[10px] text-faint sm:inline">
          ⌘K
        </kbd>
      </button>

      {/* Language switcher — placed right of search bar */}
      {languageSwitcher && (
        <div className="flex-shrink-0">
          {languageSwitcher}
        </div>
      )}

      <ReviewLink />

      <span className="ml-auto hidden text-xs text-faint lg:block">
        Interview prep · built from a real portfolio
      </span>
    </header>
  );
}

/** Link to /review with a badge showing how many flashcards are due. */
function ReviewLink() {
  const { mounted, dueIds } = useProgress();
  const due = mounted ? dueIds().length : 0;

  return (
    <Link
      href="/review"
      className="relative flex h-9 flex-shrink-0 items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-2.5 text-xs text-subtle transition-colors hover:border-line-strong hover:text-ink"
    >
      <Brain className="size-4 text-brand-400" />
      <span className="hidden sm:inline">Review</span>
      {due > 0 && (
        <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-600 px-1 font-mono text-[10px] font-semibold text-white">
          {due > 99 ? "99+" : due}
        </span>
      )}
    </Link>
  );
}
