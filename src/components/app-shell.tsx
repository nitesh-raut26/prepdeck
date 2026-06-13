"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { X } from "lucide-react";
import { ProgressProvider } from "@/components/progress-provider";
import { LanguageProvider } from "@/components/language-provider";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import { SearchPalette } from "@/components/search-palette";
import type { NavSection, SearchRecord } from "@/lib/content";

/**
 * Load LanguageSwitcher only on the client — it reads localStorage and
 * renders a different DOM tree before/after mount, which would trigger
 * a hydration mismatch if server-rendered.
 */
const LanguageSwitcher = dynamic(
  () => import("@/components/language-switcher").then((m) => m.LanguageSwitcher),
  { ssr: false },
);

const COLLAPSE_KEY = "pd-sidebar-collapsed";

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
  // Desktop sidebar collapse — persisted so the reading mode sticks.
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem(COLLAPSE_KEY) === "1") setCollapsed(true);
    } catch {
      /* best-effort */
    }
  }, []);

  function toggleCollapsed() {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? "0" : "1");
      } catch {
        /* best-effort */
      }
      return !c;
    });
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((o) => !o);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleCollapsed();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <LanguageProvider>
      <ProgressProvider>
        {/* Desktop sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 hidden overflow-hidden bg-surface-1 transition-[width] duration-200 ease-out lg:block ${
            collapsed ? "w-0 border-r-0" : "w-72 border-r border-line"
          }`}
        >
          <div className="w-72">
            <Sidebar nav={nav} />
          </div>
        </aside>

        {/* Mobile drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
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

        <div
          className={`transition-[padding] duration-200 ease-out ${
            collapsed ? "lg:pl-0" : "lg:pl-72"
          }`}
        >
          <Topbar
            onMenu={() => setSidebarOpen(true)}
            onSearch={() => setSearchOpen(true)}
            languageSwitcher={<LanguageSwitcher />}
            collapsed={collapsed}
            onToggleCollapsed={toggleCollapsed}
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
    </LanguageProvider>
  );
}
