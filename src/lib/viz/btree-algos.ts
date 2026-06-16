import type { BTreeNodeView, BTreeStep, Tone } from "./types";

/**
 * A fixed 3-level B+tree matching the ASCII diagram on the Indexing page:
 *
 *                       [50]
 *                  /            \
 *               [25]            [75]
 *             /     \          /     \
 *        [10,20] [30,40]   [60,70] [80,90]   (leaves linked left→right)
 */
const POS: Record<string, [number, number]> = {
  root: [210, 28],
  i1: [110, 96],
  i2: [310, 96],
  l1: [50, 168],
  l2: [152, 168],
  l3: [268, 168],
  l4: [370, 168],
};
const KEYS: Record<string, number[]> = {
  root: [50],
  i1: [25],
  i2: [75],
  l1: [10, 20],
  l2: [30, 40],
  l3: [60, 70],
  l4: [80, 90],
};
const CHILDREN: Record<string, string[]> = {
  root: ["i1", "i2"],
  i1: ["l1", "l2"],
  i2: ["l3", "l4"],
};
const NEXT: Record<string, string | null> = {
  l1: "l2",
  l2: "l3",
  l3: "l4",
  l4: null,
};
const ALL_IDS = ["root", "i1", "i2", "l1", "l2", "l3", "l4"];
const EDGES: [string, string][] = [
  ["root", "i1"],
  ["root", "i2"],
  ["i1", "l1"],
  ["i1", "l2"],
  ["i2", "l3"],
  ["i2", "l4"],
];
const TOTAL_KEYS = ALL_IDS.filter((id) => id.startsWith("l")).reduce(
  (n, id) => n + KEYS[id].length,
  0,
);
const isLeaf = (id: string) => id.startsWith("l");

export type BTreeQuery =
  | { kind: "eq"; key: number }
  | { kind: "range"; lo: number; hi: number };

export function parseBTreeQuery(raw: string): {
  query: BTreeQuery | null;
  error: string | null;
} {
  const s = raw.trim();
  const range = s.match(/^(\d+)\s*-\s*(\d+)$/);
  if (range) {
    const lo = Number(range[1]);
    const hi = Number(range[2]);
    if (lo > hi) return { query: null, error: "range must be low-high, e.g. 30-70" };
    return { query: { kind: "range", lo, hi }, error: null };
  }
  if (/^\d+$/.test(s)) return { query: { kind: "eq", key: Number(s) }, error: null };
  return { query: null, error: "enter a key (e.g. 70) or a range (e.g. 30-70)" };
}

/** Child to descend into: the number of separators ≤ target. */
function childFor(nodeId: string, target: number): string {
  const seps = KEYS[nodeId];
  let i = 0;
  while (i < seps.length && target >= seps[i]) i += 1;
  return CHILDREN[nodeId][i];
}

/** Walk root→leaf for `target`, returning the leaf id and the visited path. */
function descend(target: number): { leaf: string; path: string[] } {
  const path: string[] = [];
  let id = "root";
  while (!isLeaf(id)) {
    path.push(id);
    id = childFor(id, target);
  }
  path.push(id);
  return { leaf: id, path };
}

/**
 * Steps the visualizer through a B+tree lookup. Equality descends to a leaf and
 * checks it; range descends to the start leaf then follows leaf-links. Either
 * way it tracks node visits to contrast with a full table scan.
 * Pure: (query) => BTreeStep[].
 */
export function btreeSteps(query: BTreeQuery): BTreeStep[] {
  const steps: BTreeStep[] = [];
  const visited = new Set<string>();
  const matched: number[] = [];
  let active: string | null = null;

  const targetLabel =
    query.kind === "eq" ? `${query.key}` : `${query.lo}-${query.hi}`;

  const snap = (
    note: string,
    comparisons: number,
    vars: [string, string | number][],
    scanned: Set<string> = new Set(),
    hit: Set<string> = new Set(),
  ) => {
    const nodes: BTreeNodeView[] = ALL_IDS.map((id) => {
      let tone: Tone = "idle";
      if (id === active) tone = "active";
      else if (hit.has(id)) tone = "good";
      else if (scanned.has(id)) tone = "accent";
      else if (visited.has(id)) tone = "focus";
      return {
        id,
        keys: KEYS[id],
        isLeaf: isLeaf(id),
        x: POS[id][0],
        y: POS[id][1],
        next: NEXT[id] ?? null,
        tone,
      };
    });
    steps.push({
      nodes,
      edges: EDGES,
      target: targetLabel,
      active,
      matched: [...matched],
      comparisons,
      totalKeys: TOTAL_KEYS,
      note,
      vars,
    });
  };

  if (query.kind === "eq") {
    const { path } = descend(query.key);
    let comparisons = 0;
    path.forEach((id, depth) => {
      active = id;
      visited.add(id);
      comparisons += 1;
      if (!isLeaf(id)) {
        const seps = KEYS[id];
        const next = childFor(id, query.key);
        const dir = next === CHILDREN[id][0] ? "left" : "right";
        snap(
          depth === 0
            ? `Start at the root. ${query.key} vs ${seps.join(",")} → go ${dir}.`
            : `Internal node ${seps.join(",")}: ${query.key} vs ${seps.join(",")} → go ${dir}.`,
          comparisons,
          [["target", query.key], ["node hops", comparisons]],
        );
      } else {
        const found = KEYS[id].includes(query.key);
        if (found) matched.push(query.key);
        snap(
          found
            ? `Leaf [${KEYS[id].join(",")}]: found ${query.key} in ${comparisons} node hops — a full scan would have checked all ${TOTAL_KEYS} rows.`
            : `Leaf [${KEYS[id].join(",")}]: ${query.key} isn't here → not found, in just ${comparisons} hops.`,
          comparisons,
          [["target", query.key], ["node hops", comparisons], ["result", found ? "found ✓" : "absent"]],
          new Set(),
          found ? new Set([id]) : new Set(),
        );
      }
    });
    return steps;
  }

  // Range scan: descend to the leaf holding `lo`, then follow leaf-links.
  const { path } = descend(query.lo);
  let comparisons = 0;
  path.forEach((id, depth) => {
    if (isLeaf(id)) return; // handled in the scan phase below
    active = id;
    visited.add(id);
    comparisons += 1;
    const next = childFor(id, query.lo);
    const dir = next === CHILDREN[id][0] ? "left" : "right";
    snap(
      depth === 0
        ? `Range ${query.lo}-${query.hi}: descend to the start. ${query.lo} vs ${KEYS[id].join(",")} → go ${dir}.`
        : `${query.lo} vs ${KEYS[id].join(",")} → go ${dir}.`,
      comparisons,
      [["range", `${query.lo}-${query.hi}`], ["node hops", comparisons]],
    );
  });

  // Walk linked leaves collecting in-range keys until we pass hi.
  let leaf: string | null = path[path.length - 1];
  const scanned = new Set<string>();
  while (leaf) {
    active = leaf;
    visited.add(leaf);
    scanned.add(leaf);
    comparisons += 1;
    const here = KEYS[leaf].filter((k) => k >= query.lo && k <= query.hi);
    here.forEach((k) => matched.push(k));
    const beyond = KEYS[leaf].some((k) => k > query.hi);
    snap(
      beyond
        ? `Leaf [${KEYS[leaf].join(",")}]: collect ${here.join(",") || "—"}; a key exceeds ${query.hi}, so stop following the leaf links.`
        : `Leaf [${KEYS[leaf].join(",")}]: collect ${here.join(",") || "—"}; follow the leaf link →`,
      comparisons,
      [
        ["range", `${query.lo}-${query.hi}`],
        ["collected", matched.join(",") || "—"],
      ],
      scanned,
    );
    if (beyond) break;
    leaf = NEXT[leaf];
  }
  return steps;
}
