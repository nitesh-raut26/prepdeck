/**
 * Shared frame model for the algorithm visualizers.
 *
 * Every algorithm is a pure generator: (input) => Step[]. The player owns
 * playback (play / pause / step / scrub / speed) and a canvas renders one
 * step at a time, so generators stay free of React and fully unit-testable.
 */

/** Semantic colour roles; canvases map these to theme colours. */
export type Tone =
  | "idle" // untouched element
  | "active" // the element being examined right now
  | "focus" // secondary point of interest (e.g. mid, pivot candidate)
  | "good" // confirmed / sorted / visited / found
  | "bad" // rejected / mismatch
  | "muted" // eliminated from consideration
  | "accent"; // special marker (pivot, window, frontier)

export type Pointer = { label: string; index: number; tone?: Tone };

/** Inclusive index range painted with a tone (e.g. the sliding window). */
export type Span = { from: number; to: number; tone: Tone };

export type ArrayStep = {
  values: number[];
  tones?: Record<number, Tone>;
  pointers?: Pointer[];
  spans?: Span[];
  /** One-line narration of what just happened. */
  note: string;
  /** Live variables shown as chips, e.g. [["lo", 0], ["hi", 9]]. */
  vars?: [string, string | number][];
};

/* ── Stacks & queues ─────────────────────────────────────────────────── */

export type BoxesStep = {
  items: number[];
  tones?: Record<number, Tone>;
  note: string;
};

/* ── Linked lists ────────────────────────────────────────────────────── */

export type ListStep = {
  /** Nodes in fixed memory order; ids are stable across steps. */
  nodes: { id: number; value: number }[];
  /** id -> id of next node (null = points to nothing). */
  next: Record<number, number | null>;
  head: number | null;
  /** Named pointers (prev / curr / next); `at: null` renders as ∅. */
  pointers: { label: string; at: number | null; tone?: Tone }[];
  note: string;
};

/* ── Binary trees ────────────────────────────────────────────────────── */

export type PlainTree = {
  v: number;
  l?: PlainTree | null;
  r?: PlainTree | null;
};

export type TreeStep = {
  root: PlainTree | null;
  /** Node value -> tone (demo inputs keep values unique). */
  tones: Record<number, Tone>;
  note: string;
  vars?: [string, string | number][];
};

/* ── Graphs ──────────────────────────────────────────────────────────── */

export type GraphNode = { id: string; x: number; y: number };
export type GraphEdge = { a: string; b: string; w?: number };

export type GraphInput = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  directed?: boolean;
};

/** Canonical key for an undirected edge’s tone map. */
export function edgeKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

export type GraphStep = {
  nodeTones: Record<string, Tone>;
  edgeTones: Record<string, Tone>;
  note: string;
  /** Side panel showing the live queue / stack / priority queue. */
  aux?: { label: string; items: string[] };
  /** Distance table for Dijkstra. */
  table?: { head: string[]; rows: (string | number)[][] };
};

/* ── DP tables (also reused for prefix sums & Fenwick trees) ─────────── */

export type DpStep = {
  /** 2D table; 1D problems use a single row. null renders as an empty cell. */
  grid: (number | string | null)[][];
  rowLabels?: string[];
  colLabels?: string[];
  /** "row,col" -> tone */
  tones?: Record<string, Tone>;
  note: string;
  vars?: [string, string | number][];
};

/* ── Backtracking ────────────────────────────────────────────────────── */

export type BoardStep = {
  n: number;
  queens: { r: number; c: number }[];
  /** "row,col" -> tone (the cell being tried / in conflict) */
  tones?: Record<string, Tone>;
  note: string;
  vars?: [string, string | number][];
};

export type SubsetStep = {
  values: number[];
  /** Per index: chosen, skipped, or not decided yet. */
  marks: ("in" | "out" | "pending")[];
  /** Index currently being decided (-1 = none). */
  depth: number;
  results: string[];
  note: string;
};

/* ── Hash tables ─────────────────────────────────────────────────────── */

export type HashStep = {
  /** buckets[i] is the chain stored in drawer i. */
  buckets: number[][];
  activeBucket: number | null;
  /** key -> tone, applied to the matching chain entries. */
  keyTones?: Record<number, Tone>;
  note: string;
  vars?: [string, string | number][];
};

/* ── Tries ───────────────────────────────────────────────────────────── */

export type TrieNodeP = {
  id: number;
  ch: string;
  parent: number | null;
  /** True when a word ends here. */
  word: boolean;
};

export type TrieStep = {
  nodes: TrieNodeP[];
  tones: Record<number, Tone>;
  note: string;
  vars?: [string, string | number][];
};

/* ── Union-Find ──────────────────────────────────────────────────────── */

export type UfStep = {
  /** parent[i] === i means i is a root. */
  parent: number[];
  tones?: Record<number, Tone>;
  note: string;
  vars?: [string, string | number][];
};

/* ── Intervals ───────────────────────────────────────────────────────── */

export type IntervalItem = { s: number; e: number; tone: Tone; label?: string };

export type IntervalStep = {
  intervals: IntervalItem[];
  /** Second lane drawn below (e.g. the merged output being built). */
  output?: IntervalItem[];
  note: string;
  vars?: [string, string | number][];
};

/* ── String matching ─────────────────────────────────────────────────── */

export type MatchStep = {
  text: string;
  pattern: string;
  /** Pattern's left edge sits under text index `offset`. */
  offset: number;
  textTones?: Record<number, Tone>;
  patTones?: Record<number, Tone>;
  /** KMP failure table, shown under the pattern (null = not built yet). */
  lps?: (number | null)[];
  note: string;
  vars?: [string, string | number][];
};

/* ── Metadata shown in the player header ─────────────────────────────── */

export type Complexity = { time: string; space: string };
