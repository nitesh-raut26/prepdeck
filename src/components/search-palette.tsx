"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import { CornerDownLeft, Search, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { SearchRecord } from "@/lib/content";

export function SearchPalette({
  open,
  onClose,
  records,
}: {
  open: boolean;
  onClose: () => void;
  records: SearchRecord[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(records, {
        keys: [
          { name: "title", weight: 0.5 },
          { name: "tags", weight: 0.2 },
          { name: "summary", weight: 0.2 },
          { name: "text", weight: 0.1 },
        ],
        threshold: 0.4,
        ignoreLocation: true,
        minMatchCharLength: 2,
      }),
    [records],
  );

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return records.slice(0, 8);
    return fuse.search(q, { limit: 12 }).map((r) => r.item);
  }, [query, fuse, records]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      // focus after the dialog paints
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!open) return null;

  function go(rec: SearchRecord | undefined) {
    if (!rec) return;
    onClose();
    router.push(rec.href);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-surface-1 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search className="size-4 shrink-0 text-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                go(results[active]);
              } else if (e.key === "Escape") {
                onClose();
              }
            }}
            placeholder="Search topics, projects, questions…"
            className="flex-1 bg-transparent py-3.5 text-sm text-ink outline-none placeholder:text-faint"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-faint hover:text-ink"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <ul className="no-scrollbar max-h-[55vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-faint">
              No matches for “{query}”.
            </li>
          )}
          {results.map((rec, i) => (
            <li key={rec.href}>
              <button
                type="button"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(rec)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left",
                  i === active ? "bg-surface-3" : "hover:bg-surface-2",
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-ink">
                    {rec.title}
                  </div>
                  {rec.summary && (
                    <div className="truncate text-xs text-faint">
                      {rec.summary}
                    </div>
                  )}
                </div>
                <span className="shrink-0 rounded-md bg-surface-3 px-2 py-0.5 text-[10px] uppercase tracking-wide text-subtle">
                  {rec.sectionLabel}
                </span>
                {i === active && (
                  <CornerDownLeft className="size-3.5 shrink-0 text-faint" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
