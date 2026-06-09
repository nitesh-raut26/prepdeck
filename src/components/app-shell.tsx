"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ProgressProvider } from "@/components/progress-provider";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { SearchPalette } from "@/components/search-palette";
import type { NavSection, SearchRecord } from "@/lib/content";

export function AppShell({
  nav,
  searchIndex,
  children,
}: {
  nav: NavSection[];
  searchIndex: SearchRecord[];
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <ProgressProvider>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-line bg-surface-1 lg:block">
        <Sidebar nav={nav} />
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[82%] border-r border-line bg-surface-1">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close navigation"
              className="absolute right-3 top-5 rounded-lg p-1.5 text-faint hover:text-ink"
            >
              <X className="size-5" />
            </button>
            <Sidebar nav={nav} onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-72">
        <Topbar
          onMenu={() => setSidebarOpen(true)}
          onSearch={() => setSearchOpen(true)}
        />
        <main className="mx-auto max-w-3xl px-5 py-9 lg:px-10 lg:py-12">
          {children}
        </main>
      </div>

      <SearchPalette
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        records={searchIndex}
      />
    </ProgressProvider>
  );
}
