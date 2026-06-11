import type { Tone } from "@/lib/viz/types";

/**
 * Tone → Tailwind classes for box-style cells (array, stack, queue, heap).
 * Semantic roles live in the generators; colours live here, once.
 */
export const CELL_TONE: Record<Tone, string> = {
  idle: "border-line bg-surface-3 text-ink",
  active: "border-brand-500 bg-brand-600/25 text-brand-300",
  focus: "border-sky-500/60 bg-sky-500/15 text-sky-300",
  good: "border-emerald-500/60 bg-emerald-500/15 text-emerald-300",
  bad: "border-rose-500/60 bg-rose-500/15 text-rose-300",
  muted: "border-line bg-surface-2 text-faint opacity-50",
  accent: "border-amber-500/60 bg-amber-500/15 text-amber-300",
};

export const TEXT_TONE: Record<Tone, string> = {
  idle: "text-subtle",
  active: "text-brand-300",
  focus: "text-sky-300",
  good: "text-emerald-300",
  bad: "text-rose-300",
  muted: "text-faint",
  accent: "text-amber-300",
};

/** Tone → SVG fill/stroke (hex, matching the Tailwind palette used above). */
export const SVG_TONE: Record<Tone, { fill: string; stroke: string; text: string }> = {
  idle: { fill: "#1c2433", stroke: "#324056", text: "#e8ecf4" },
  active: { fill: "rgba(79,70,229,0.45)", stroke: "#818cf8", text: "#e0e7ff" },
  focus: { fill: "rgba(14,165,233,0.30)", stroke: "#38bdf8", text: "#bae6fd" },
  good: { fill: "rgba(16,185,129,0.30)", stroke: "#34d399", text: "#a7f3d0" },
  bad: { fill: "rgba(244,63,94,0.30)", stroke: "#fb7185", text: "#fecdd3" },
  muted: { fill: "#141a26", stroke: "#222b3b", text: "#6b7689" },
  accent: { fill: "rgba(245,158,11,0.30)", stroke: "#fbbf24", text: "#fde68a" },
};
