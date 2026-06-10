"use client";

import { Menu, Search } from "lucide-react";

export function Topbar({
  onMenu,
  onSearch,
  languageSwitcher,
}: {
  onMenu: () => void;
  onSearch: () => void;
  languageSwitcher?: React.ReactNode;
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

      <span className="ml-auto hidden text-xs text-faint lg:block">
        SDE2 prep · built from a real portfolio
      </span>
    </header>
  );
}
