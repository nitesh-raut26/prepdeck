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
  idle: { fill: "#e9dfc6", stroke: "#c3b58e", text: "#36301e" },
  active: { fill: "rgba(79,70,229,0.14)", stroke: "#4f46e5", text: "#3730a3" },
  focus: { fill: "rgba(2,132,199,0.12)", stroke: "#0284c7", text: "#075985" },
  good: { fill: "rgba(5,150,105,0.12)", stroke: "#059669", text: "#065f46" },
  bad: { fill: "rgba(225,29,72,0.10)", stroke: "#e11d48", text: "#9f1239" },
  muted: { fill: "#f3ecda", stroke: "#dcd0b3", text: "#7e7458" },
  accent: { fill: "rgba(217,119,6,0.12)", stroke: "#d97706", text: "#92400e" },
};
