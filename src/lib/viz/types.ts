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

/* ── LRU cache (LLD) ─────────────────────────────────────────────────── */

export type LruEntry = { key: number; val: number; tone?: Tone };

export type LruStep = {
  capacity: number;
  /** Recency order: most-recently-used (left) → least-recently-used (right). */
  order: LruEntry[];
  /** Keys currently present in the hash map (shown sorted, to read as an index). */
  mapKeys: number[];
  /** Key the map lookup is touching this step (highlights the chip). */
  mapActive?: number | null;
  /** Short label for the operation, e.g. "put(3, 30)". */
  op?: string;
  /** Operation outcome chip, e.g. "→ 30", "miss → -1", "evict 2". */
  result?: string;
  note: string;
  vars?: [string, string | number][];
};

/* ── State machines (LLD) ────────────────────────────────────────────── */

export type SmState = {
  id: string;
  /** Short label shown in the node (keep ≤ ~7 chars). */
  label: string;
  x: number;
  y: number;
};

export type SmTransition = { from: string; to: string; event: string };

export type StateMachine = {
  title: string;
  initial: string;
  states: SmState[];
  transitions: SmTransition[];
};

export type SmStep = {
  /** Active state id this frame. */
  current: string;
  /** Transition just taken (highlights that edge), or null. */
  active?: { from: string; to: string; event: string } | null;
  /** The event being processed this frame. */
  event?: string | null;
  /** Was the event handled by a transition from `current`? */
  accepted?: boolean;
  /** Events processed so far (most recent last). */
  log: string[];
  /** Events still queued. */
  upcoming: string[];
  note: string;
  vars?: [string, string | number][];
};

/* ── Observer / pub-sub fan-out (LLD) ────────────────────────────────── */

export type ObserverNode = {
  id: string;
  /** Currently subscribed to the subject? */
  subscribed: boolean;
  tone?: Tone;
};

export type ObserverStep = {
  /** Last value the subject published (null before the first publish). */
  subjectValue: string | number | null;
  /** Fixed pool of observers, in stable display order. */
  observers: ObserverNode[];
  /** Observer id currently receiving a notification (highlights its wire). */
  delivering?: string | null;
  /** Whether the subject is mid-publish (lights up the subject). */
  publishing?: boolean;
  op?: string;
  /** Observers notified during the current publish. */
  log: string[];
  note: string;
  vars?: [string, string | number][];
};

/* ── Parking lot allocation (LLD) ────────────────────────────────────── */

export type VehicleSize = "M" | "C" | "L"; // motorcycle, car, large

export type ParkingSpotView = {
  id: number;
  size: VehicleSize;
  /** Label of the parked vehicle, or null when free. */
  occupant: string | null;
  tone?: Tone;
};

export type ParkingStep = {
  spots: ParkingSpotView[];
  /** Spot index the scan is currently examining. */
  cursor?: number | null;
  op?: string;
  note: string;
  vars?: [string, string | number][];
};

/* ── Splitwise debt simplification (LLD) ─────────────────────────────── */

export type DebtPerson = { id: string; balance: number; tone?: Tone };

export type SplitStep = {
  people: DebtPerson[];
  /** Settlement transfers decided so far (debtor → creditor). */
  settlements: { from: string; to: string; amount: number }[];
  /** Original raw-debt count, for the "X → Y transactions" payoff. */
  rawCount: number;
  note: string;
  vars?: [string, string | number][];
};

/* ── Token bucket / rate limiting (HLD) ──────────────────────────────── */

export type TokenBucketStep = {
  /** Bucket size B — the maximum burst a quiet period earns. */
  capacity: number;
  /** Refill rate R, tokens per second. */
  rate: number;
  /** Tokens available right now (integer, 0..capacity). */
  tokens: number;
  /** Simulated clock, in seconds. */
  time: number;
  /** What this frame is showing. */
  phase: "start" | "refill" | "allow" | "reject";
  /** Label of the request handled this frame, if any (e.g. "r6"). */
  request?: string | null;
  /** Rolling outcome strip — most recent last. */
  log: { label: string; ok: boolean }[];
  note: string;
  vars?: [string, string | number][];
};

/* ── Cache hit/miss + eviction (HLD) ─────────────────────────────────── */

export type CacheCell = { key: string; tone?: Tone };

export type CacheStep = {
  capacity: number;
  /** Cache entries, most-recently-used (left) → least-recently-used (right). */
  cache: CacheCell[];
  /** Key requested this frame. */
  request?: string | null;
  phase: "start" | "hit" | "miss" | "evict";
  hits: number;
  misses: number;
  /** Key evicted this frame (LRU victim), for the note. */
  evicted?: string | null;
  note: string;
  vars?: [string, string | number][];
};

/* ── Consistent-hashing ring (HLD) ───────────────────────────────────── */

export type RingNode = { id: string; angle: number; tone?: Tone };
export type RingKey = {
  id: string;
  angle: number;
  /** Node id this key currently belongs to (next node clockwise). */
  owner: string;
  tone?: Tone;
};

export type HashRingStep = {
  nodes: RingNode[];
  keys: RingKey[];
  /** Key id being routed/highlighted this frame (draws its arc to the owner). */
  active?: string | null;
  note: string;
  vars?: [string, string | number][];
};

/* ── Leader–follower replication (HLD) ───────────────────────────────── */

export type ReplicaNode = {
  id: string;
  role: "leader" | "follower";
  /** Last write version this node has applied. */
  version: number;
  tone?: Tone;
};

export type ReplicationStep = {
  nodes: ReplicaNode[];
  phase: "start" | "write" | "replicate" | "read-fresh" | "read-stale";
  /** Node id acted on this frame. */
  active?: string | null;
  /** Read result shown this frame, if any. */
  readValue?: string | null;
  note: string;
  vars?: [string, string | number][];
};

/* ── Request flow through the tiers (HLD) ────────────────────────────── */

export type RequestFlowStep = {
  /** How many app servers sit behind the load balancer. */
  serverCount: number;
  /** Index of the app server handling this request (round-robin), or null. */
  activeServer: number | null;
  /** Which tier is lit this frame. */
  stage: "client" | "lb" | "app" | "cache" | "db" | "respond";
  cacheOutcome?: "hit" | "miss" | null;
  /** Label of the request in flight, e.g. "GET /u/7". */
  request: string;
  note: string;
  vars?: [string, string | number][];
};

/* ── B+tree index lookup (Databases) ─────────────────────────────────── */

export type BTreeNodeView = {
  id: string;
  keys: number[];
  isLeaf: boolean;
  x: number;
  y: number;
  /** Next leaf in the linked list (for range scans), or null. */
  next?: string | null;
  tone?: Tone;
};

export type BTreeStep = {
  nodes: BTreeNodeView[];
  /** Parent→child edges to draw (constant across steps). */
  edges: [string, string][];
  /** The search target shown in the header — a key or "a-b" range. */
  target: string;
  /** Node currently being examined. */
  active?: string | null;
  /** Keys matched so far (equality hit, or the range collection). */
  matched: number[];
  /** Node visits so far — contrasted with a full scan of every row. */
  comparisons: number;
  /** Total keys in the table, for the "vs full scan" payoff. */
  totalKeys: number;
  note: string;
  vars?: [string, string | number][];
};

/* ── Transaction isolation (Databases) ───────────────────────────────── */

export type TxnOp = { txn: "T1" | "T2"; label: string; tone?: Tone };

export type IsolationStep = {
  scenario: string;
  /** Isolation level label, e.g. "Read Committed". */
  level: string;
  /** Interleaved op timeline for both transactions. */
  ops: TxnOp[];
  /** Index of the op being executed (-1 before start). */
  activeIndex: number;
  /** Value T1 observes at its critical read, if shown this frame. */
  t1Sees?: string | null;
  /** Whether the anomaly occurred at this level. */
  verdict?: "anomaly" | "prevented" | null;
  note: string;
  vars?: [string, string | number][];
};

/* ── Metadata shown in the player header ─────────────────────────────── */

export type Complexity = { time: string; space: string };
