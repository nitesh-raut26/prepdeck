"use client";

import { Fragment } from "react";
import { cn } from "@/lib/cn";
import type { LruStep } from "@/lib/viz/types";
import { CELL_TONE } from "./tones";

/**
 * Two stacked panels: the hash map (key → node) on top and the doubly linked
 * list in recency order below. A lookup highlights the same key in both, so
 * the map → node link is visible without drawing literal arrows between them.
 */
export function LruCanvas({ step }: { step: LruStep }) {
  const { order, mapKeys, mapActive, capacity, op, result } = step;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4">
      {(op || result) && (
        <div className="flex flex-wrap items-center gap-2">
          {op && (
            <span className="rounded-md border border-line bg-surface-3 px-2 py-0.5 font-mono text-[12px] text-ink">
              {op}
            </span>
          )}
          {result && (
            <span className="font-mono text-[12px] text-faint">{result}</span>
          )}
        </div>
      )}

      {/* Hash map */}
      <div>
        <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wide text-faint">
          HashMap · key → node
        </span>
        <div className="flex min-h-[2.75rem] flex-wrap items-center gap-1.5 rounded-xl border border-dashed border-line-strong p-2">
          {mapKeys.length === 0 && (
            <span className="px-2 text-xs text-faint">(empty)</span>
          )}
          {mapKeys.map((k) => (
            <span
              key={k}
              className={cn(
                "flex h-8 items-center gap-1 rounded-lg border px-2 font-mono text-[12px] transition-colors",
                mapActive === k
                  ? CELL_TONE.active
                  : "border-line bg-surface-3 text-subtle",
              )}
            >
              {k}
              <span className="opacity-50">→●</span>
            </span>
          ))}
        </div>
      </div>

      {/* Doubly linked list, recency order */}
      <div>
        <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-wide text-faint">
          Doubly linked list · MRU ↔ LRU
        </span>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          <Sentinel label="head" sub="MRU" />
          {order.map((e) => (
            <Fragment key={e.key}>
              <Sep />
              <div
                className={cn(
                  "flex min-w-[3.25rem] flex-col items-center justify-center rounded-lg border px-2 py-1.5 font-mono transition-colors",
                  CELL_TONE[e.tone ?? "idle"],
                )}
              >
                <span className="text-[13px] font-semibold leading-none">
                  {e.key}
                </span>
                <span className="mt-0.5 text-[10px] leading-none opacity-70">
                  val {e.val}
                </span>
              </div>
            </Fragment>
          ))}
          <Sep />
          <Sentinel label="tail" sub="LRU" />
        </div>
      </div>

      <p className="text-[11px] text-faint">
        size {order.length}/{capacity} · left = most recent, right = first to be
        evicted
      </p>
    </div>
  );
}

function Sep() {
  return <span className="shrink-0 px-0.5 font-mono text-faint">⇄</span>;
}

function Sentinel({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="flex min-w-[2.75rem] shrink-0 flex-col items-center justify-center rounded-lg border border-dashed border-line-strong bg-surface-2 px-2 py-1.5 text-faint">
      <span className="text-[11px] font-semibold leading-none">{label}</span>
      <span className="mt-0.5 text-[9px] uppercase leading-none tracking-wide">
        {sub}
      </span>
    </div>
  );
}
