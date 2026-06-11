"use client";

import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Complexity } from "@/lib/viz/types";
import type { Stepper } from "./stepper";

const SPEEDS = [0.5, 1, 2] as const;

type BaseStep = { note: string; vars?: [string, string | number][] };

/**
 * Shared chrome for every visualizer: header with complexity badges, the
 * canvas (children), per-step narration, live variables, and transport
 * controls (reset / step back / play–pause / step forward / scrub / speed).
 */
export function VizPlayer<S extends BaseStep>({
  title,
  complexity,
  stepper,
  inputs,
  children,
}: {
  title: string;
  complexity: Complexity;
  stepper: Stepper<S>;
  /** Input editors rendered below the controls (change data → new steps). */
  inputs?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { step } = stepper;

  return (
    <div className="not-prose my-6 overflow-hidden rounded-2xl border border-line bg-surface-1">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface-2 px-4 py-2.5">
        <span className="text-sm font-semibold text-ink">{title}</span>
        <span className="flex items-center gap-1.5 font-mono text-[11px]">
          <span className="rounded-md border border-brand-500/40 bg-brand-600/15 px-1.5 py-0.5 text-brand-300">
            time {complexity.time}
          </span>
          <span className="rounded-md border border-line bg-surface-3 px-1.5 py-0.5 text-subtle">
            space {complexity.space}
          </span>
        </span>
      </div>

      {/* Canvas */}
      <div className="overflow-x-auto px-4 py-5">{children}</div>

      {/* Narration + live variables */}
      <div className="min-h-[3.25rem] border-t border-line bg-surface-2/60 px-4 py-2.5">
        <p className="text-[13px] leading-relaxed text-subtle">
          <span className="mr-2 font-mono text-[11px] text-faint">
            {stepper.idx + 1}/{stepper.total}
          </span>
          {step?.note}
        </p>
        {step?.vars && step.vars.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {step.vars.map(([k, v]) => (
              <span
                key={k}
                className="rounded-md border border-line bg-surface-3 px-1.5 py-0.5 font-mono text-[11px] text-subtle"
              >
                {k} = <span className="text-ink">{v}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Transport */}
      <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-2.5">
        <button
          type="button"
          onClick={stepper.reset}
          aria-label="Reset"
          className="rounded-lg border border-line p-1.5 text-subtle transition-colors hover:bg-surface-3 hover:text-ink"
        >
          <RotateCcw className="size-4" />
        </button>
        <button
          type="button"
          onClick={stepper.prev}
          disabled={stepper.idx === 0}
          aria-label="Step back"
          className="rounded-lg border border-line p-1.5 text-subtle transition-colors hover:bg-surface-3 hover:text-ink disabled:opacity-40"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={stepper.toggle}
          aria-label={stepper.playing ? "Pause" : "Play"}
          className="rounded-lg bg-brand-600 p-1.5 text-white transition-colors hover:bg-brand-500"
        >
          {stepper.playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        </button>
        <button
          type="button"
          onClick={stepper.next}
          disabled={stepper.atEnd}
          aria-label="Step forward"
          className="rounded-lg border border-line p-1.5 text-subtle transition-colors hover:bg-surface-3 hover:text-ink disabled:opacity-40"
        >
          <ChevronRight className="size-4" />
        </button>

        <input
          type="range"
          min={0}
          max={Math.max(0, stepper.total - 1)}
          value={stepper.idx}
          onChange={(e) => stepper.seek(Number(e.target.value))}
          aria-label="Scrub through steps"
          className="h-1.5 min-w-24 flex-1 cursor-pointer accent-brand-500"
        />

        <div className="flex items-center gap-0.5 rounded-lg border border-line p-0.5">
          {SPEEDS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => stepper.setSpeed(s)}
              className={cn(
                "rounded-md px-1.5 py-0.5 font-mono text-[11px] transition-colors",
                stepper.speed === s
                  ? "bg-surface-3 text-ink"
                  : "text-faint hover:text-subtle",
              )}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* Input editors */}
      {inputs && (
        <div className="flex flex-wrap items-end gap-3 border-t border-line bg-surface-2/40 px-4 py-3">
          {inputs}
        </div>
      )}
    </div>
  );
}

/* Small labelled input used by the visualizer input rows. */
export function VizField({
  label,
  value,
  onChange,
  onCommit,
  wide,
  error,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  wide?: boolean;
  error?: string | null;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-faint">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onCommit}
        onKeyDown={(e) => e.key === "Enter" && onCommit()}
        className={cn(
          "rounded-lg border bg-surface-1 px-2.5 py-1.5 font-mono text-xs text-ink outline-none transition-colors focus:border-brand-500",
          error ? "border-rose-500/60" : "border-line",
          wide ? "w-64 max-w-full" : "w-24",
        )}
      />
      {error && <span className="text-[11px] text-rose-400">{error}</span>}
    </label>
  );
}
