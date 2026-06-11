import type { IntervalItem, IntervalStep } from "./types";

/** Parse "1-4, 3-5, 0-6" into intervals. */
export function parseIntervals(text: string): [number, number][] {
  return text
    .split(/[,;\n]+/)
    .map((s) => s.trim().match(/^(\d+)\s*[-–]\s*(\d+)$/))
    .filter((m): m is RegExpMatchArray => !!m)
    .map((m) => [Number(m[1]), Number(m[2])] as [number, number])
    .filter(([s, e]) => s < e && e <= 24)
    .slice(0, 8);
}

const item = (
  [s, e]: [number, number],
  tone: IntervalItem["tone"],
  label?: string,
): IntervalItem => ({ s, e, tone, label });

/* ── Greedy: activity selection (most non-overlapping meetings) ───────── */

export function activitySelectionSteps(input: [number, number][]): IntervalStep[] {
  const sorted = [...input].sort((a, b) => a[1] - b[1]);
  const steps: IntervalStep[] = [];

  steps.push({
    intervals: input.map((iv) => item(iv, "idle")),
    note: `${input.length} meetings, one room. Goal: attend as MANY as possible. Greedy idea: always take the meeting that ends earliest — finishing early leaves the most room for the rest.`,
  });
  steps.push({
    intervals: sorted.map((iv) => item(iv, "idle")),
    note: "Step 1 (almost every interval problem starts here): sort by END time. Top to bottom is now 'finishes soonest first'.",
  });

  const picked: [number, number][] = [];
  let lastEnd = -1;
  for (let i = 0; i < sorted.length; i++) {
    const [s, e] = sorted[i];
    const state = (j: number): IntervalItem["tone"] =>
      picked.some(([ps, pe]) => ps === sorted[j][0] && pe === sorted[j][1])
        ? "good"
        : j < i
          ? "muted"
          : "idle";
    const base = sorted.map((iv, j) => item(iv, j === i ? "active" : state(j)));

    if (s >= lastEnd) {
      steps.push({
        intervals: base,
        note: `Meeting ${s}–${e}: starts ${lastEnd < 0 ? "first" : `at ${s}, and the room frees up at ${lastEnd}`} — no clash. Take it.`,
        vars: [["taken", picked.length + 1]],
      });
      picked.push([s, e]);
      lastEnd = e;
    } else {
      steps.push({
        intervals: sorted.map((iv, j) =>
          item(iv, j === i ? "bad" : state(j)),
        ),
        note: `Meeting ${s}–${e}: starts at ${s} but the room is busy until ${lastEnd} — clash. Skip it. (Anything it could offer, the earlier-ending pick already offers more of.)`,
        vars: [["taken", picked.length]],
      });
    }
  }

  steps.push({
    intervals: sorted.map((iv) =>
      item(iv, picked.some(([ps, pe]) => ps === iv[0] && pe === iv[1]) ? "good" : "muted"),
    ),
    note: `Done: ${picked.length} meetings (${picked.map(([s, e]) => `${s}–${e}`).join(", ")}). One sort + one pass = O(n log n). The greedy choice is provably safe here — swapping any pick for a later-ending one never helps.`,
    vars: [["answer", picked.length]],
  });
  return steps;
}

/* ── Merge overlapping intervals ──────────────────────────────────────── */

export function mergeIntervalsSteps(input: [number, number][]): IntervalStep[] {
  const sorted = [...input].sort((a, b) => a[0] - b[0]);
  const steps: IntervalStep[] = [];
  const merged: [number, number][] = [];

  steps.push({
    intervals: input.map((iv) => item(iv, "idle")),
    output: [],
    note: "Merge every overlapping pair into one block (think: calendar busy-bars). Unsorted, overlaps are scattered everywhere…",
  });
  steps.push({
    intervals: sorted.map((iv) => item(iv, "idle")),
    output: [],
    note: "…so sort by START. Now any interval can only overlap the one block we're currently building — never something far back.",
  });

  for (let i = 0; i < sorted.length; i++) {
    const [s, e] = sorted[i];
    const cur = merged[merged.length - 1];
    const lane = (extra?: number): IntervalItem[] =>
      sorted.map((iv, j) => item(iv, j === i ? "active" : j < i ? "muted" : "idle", extra === j ? "" : undefined));

    if (!cur || s > cur[1]) {
      steps.push({
        intervals: lane(),
        output: merged.map((iv) => item(iv, "good")),
        note: cur
          ? `${s}–${e} starts after the current block ends (${s} > ${cur[1]}) — a gap. Close that block and start a new one.`
          : `First interval ${s}–${e} starts the first block.`,
      });
      merged.push([s, e]);
    } else {
      const newEnd = Math.max(cur[1], e);
      steps.push({
        intervals: lane(),
        output: [
          ...merged.slice(0, -1).map((iv) => item(iv, "good")),
          item(cur, "accent"),
        ],
        note: `${s}–${e} starts at ${s}, inside the current block (…–${cur[1]}) — overlap. Stretch the block's end to max(${cur[1]}, ${e}) = ${newEnd}.`,
      });
      cur[1] = newEnd;
    }
  }

  steps.push({
    intervals: sorted.map((iv) => item(iv, "muted")),
    output: merged.map((iv) => item(iv, "good", `${iv[0]}–${iv[1]}`)),
    note: `Done: ${merged.length} block${merged.length === 1 ? "" : "s"}: ${merged.map(([s, e]) => `${s}–${e}`).join(", ")}. Sort once, sweep once — O(n log n).`,
    vars: [["blocks", merged.length]],
  });
  return steps;
}
