import type { HashRingStep, RingKey, RingNode } from "./types";

const MAX_KEYS = 8;

/** Small stable string hash → an angle 0..359 on the ring. */
export function hashAngle(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 360;
}

/** Owner = first node at or clockwise-after the key's angle (wrapping around). */
function ownerOf(angle: number, nodes: RingNode[]): string {
  const sorted = [...nodes].sort((a, b) => a.angle - b.angle);
  for (const n of sorted) if (n.angle >= angle) return n.id;
  return sorted[0].id; // wrapped past 360 → smallest angle
}

export function parseRingKeys(raw: string): {
  keys: string[] | null;
  error: string | null;
} {
  const keys = raw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (keys.length === 0)
    return { keys: null, error: "enter keys, e.g. user1 cart9 ord42" };
  if (keys.length > MAX_KEYS)
    return { keys: null, error: `keep it to ≤ ${MAX_KEYS} keys` };
  return { keys, error: null };
}

/** Three physical nodes, evenly spaced; a fourth is added mid-demo. */
const BASE_NODES: RingNode[] = [
  { id: "N1", angle: 20 },
  { id: "N2", angle: 140 },
  { id: "N3", angle: 260 },
];
const NEW_NODE: RingNode = { id: "N4", angle: 320 };

/**
 * Consistent hashing, stepped for the visualizer: place keys on the ring,
 * route each to the next node clockwise, then ADD a node and show that only
 * the keys in its new arc move (~1/N), not the whole dataset.
 * Pure: (keyNames) => HashRingStep[].
 */
export function hashRingSteps(keyNames: string[]): HashRingStep[] {
  const steps: HashRingStep[] = [];
  const nodes = BASE_NODES.map((n) => ({ ...n }));
  const keys: RingKey[] = keyNames.map((id) => {
    const angle = hashAngle(id);
    return { id, angle, owner: ownerOf(angle, nodes) };
  });

  steps.push({
    nodes: nodes.map((n) => ({ ...n })),
    keys: keys.map((k) => ({ ...k, tone: "idle" })),
    note: `${nodes.length} nodes on the ring. Each key belongs to the next node clockwise from its hash position — that's the whole rule.`,
    vars: [["nodes", nodes.length]],
  });

  // Route each key to its owner, one at a time.
  keys.forEach((k) => {
    steps.push({
      nodes: nodes.map((n) => ({ ...n })),
      keys: keys.map((x) => ({
        ...x,
        tone: x.id === k.id ? "active" : x.owner ? "good" : "idle",
      })),
      active: k.id,
      note: `${k.id} (∠${k.angle}°) → walks clockwise → owned by ${k.owner}.`,
      vars: [
        ["key", k.id],
        ["owner", k.owner],
      ],
    });
  });

  // Add a node; recompute owners and flag only the keys that moved.
  const withNew = [...nodes, { ...NEW_NODE }];
  const moved: string[] = [];
  const reassigned = keys.map((k) => {
    const newOwner = ownerOf(k.angle, withNew);
    if (newOwner !== k.owner) moved.push(k.id);
    return { ...k, owner: newOwner };
  });

  steps.push({
    nodes: withNew.map((n) => ({
      ...n,
      tone: n.id === NEW_NODE.id ? "accent" : "idle",
    })),
    keys: reassigned.map((k) => ({
      ...k,
      tone: moved.includes(k.id) ? "accent" : "good",
    })),
    note: `Add ${NEW_NODE.id} at ∠${NEW_NODE.angle}°. Only keys in its new arc move to it: ${
      moved.length ? moved.join(", ") : "none this time"
    } — about 1/N of keys, not the whole dataset.`,
    vars: [
      ["nodes", withNew.length],
      ["keys moved", `${moved.length}/${keys.length}`],
    ],
  });

  return steps;
}
