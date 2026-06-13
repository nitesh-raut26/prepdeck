import type { LruStep, Tone } from "./types";

/**
 * LRU cache as a hash map (key → node) plus a doubly linked list in recency
 * order. The generator is pure: (capacity, ops) => LruStep[], so the player
 * and canvas stay free of cache logic and the steps are unit-testable.
 *
 * The narration is deliberately jargon-light — it keeps re-deriving *why* the
 * two structures are paired, which is the whole point of the LLD question.
 */
export type LruOp =
  | { type: "put"; key: number; val: number }
  | { type: "get"; key: number };

const OP_RE = /(put|get)\s*\(\s*(-?\d+)\s*(?:,\s*(-?\d+)\s*)?\)/gi;
const MAX_OPS = 12;

/** Parse "put(1,10); get(1); put(2,20)" → ops. Returns null on bad input. */
export function parseLruOps(raw: string): {
  ops: LruOp[] | null;
  error: string | null;
} {
  const ops: LruOp[] = [];
  let m: RegExpExecArray | null;
  OP_RE.lastIndex = 0;
  while ((m = OP_RE.exec(raw))) {
    const type = m[1].toLowerCase();
    if (type === "put") {
      if (m[3] === undefined) {
        return { ops: null, error: "put needs two numbers, e.g. put(1, 10)" };
      }
      ops.push({ type: "put", key: Number(m[2]), val: Number(m[3]) });
    } else {
      ops.push({ type: "get", key: Number(m[2]) });
    }
  }
  if (ops.length === 0) {
    return { ops: null, error: "Use ops like put(1, 10), get(1), put(2, 20)" };
  }
  if (ops.length > MAX_OPS) {
    return { ops: null, error: `Keep it to ≤ ${MAX_OPS} ops so steps stay readable` };
  }
  return { ops, error: null };
}

export function lruSteps(capacity: number, ops: LruOp[]): LruStep[] {
  capacity = Math.max(1, Math.min(Math.trunc(capacity) || 1, 5));
  const order: { key: number; val: number }[] = []; // index 0 = MRU, last = LRU
  const steps: LruStep[] = [];

  const snap = (s: {
    note: string;
    op?: string;
    result?: string;
    mapActive?: number | null;
    tones?: Record<number, Tone>;
    vars?: [string, string | number][];
  }) => {
    const tones = s.tones ?? {};
    steps.push({
      capacity,
      order: order.map((e) => ({ ...e, tone: tones[e.key] })),
      mapKeys: order.map((e) => e.key).sort((a, b) => a - b),
      mapActive: s.mapActive ?? null,
      op: s.op,
      result: s.result,
      note: s.note,
      vars: s.vars,
    });
  };

  snap({
    note: `Empty cache, capacity ${capacity}. The map (top) finds any key in O(1). The list (bottom) keeps everything in recency order — most-recently-used on the left, least-recently-used on the right.`,
    vars: [["size", `0/${capacity}`]],
  });

  for (const op of ops) {
    if (op.type === "get") {
      const idx = order.findIndex((e) => e.key === op.key);
      if (idx === -1) {
        snap({
          op: `get(${op.key})`,
          result: "miss → -1",
          mapActive: op.key,
          note: `get(${op.key}): the map has no entry for ${op.key}, so it's a miss — return -1. One lookup, no list walk.`,
          vars: [["key", op.key], ["result", -1]],
        });
        continue;
      }
      const e = order[idx];
      snap({
        op: `get(${op.key})`,
        mapActive: op.key,
        tones: { [op.key]: "active" },
        note: `get(${op.key}): the map points straight at the node — its value is ${e.val}. Touching it makes it the most-recently-used, so it has to move to the front.`,
        vars: [["key", op.key], ["value", e.val]],
      });
      order.splice(idx, 1);
      order.unshift(e);
      snap({
        op: `get(${op.key})`,
        result: `→ ${e.val}`,
        tones: { [op.key]: "good" },
        note: `Unlinked ${op.key} and spliced it back at the head — O(1), because a doubly linked node knows its own neighbours. Return ${e.val}.`,
        vars: [["key", op.key], ["value", e.val]],
      });
      continue;
    }

    // put
    const idx = order.findIndex((e) => e.key === op.key);
    if (idx !== -1) {
      const e = order[idx];
      e.val = op.val;
      order.splice(idx, 1);
      order.unshift(e);
      snap({
        op: `put(${op.key}, ${op.val})`,
        result: "update",
        mapActive: op.key,
        tones: { [op.key]: "good" },
        note: `put(${op.key}, ${op.val}): the key already exists — overwrite its value and promote it to the front. Nothing is evicted.`,
        vars: [["key", op.key], ["value", op.val], ["size", `${order.length}/${capacity}`]],
      });
      continue;
    }

    if (order.length === capacity) {
      const lru = order[order.length - 1];
      snap({
        op: `put(${op.key}, ${op.val})`,
        result: `evict ${lru.key}`,
        tones: { [lru.key]: "bad" },
        note: `Cache is full (${capacity}/${capacity}) and ${op.key} is new. Evict the tail first — key ${lru.key} is the least-recently-used. Remove it from the list and the map.`,
        vars: [["evict", lru.key], ["size", `${order.length}/${capacity}`]],
      });
      order.pop();
    }
    order.unshift({ key: op.key, val: op.val });
    snap({
      op: `put(${op.key}, ${op.val})`,
      result: "insert",
      mapActive: op.key,
      tones: { [op.key]: "good" },
      note: `Insert ${op.key} at the head (most-recently-used) and add key → node to the map. Size is now ${order.length}/${capacity}.`,
      vars: [["key", op.key], ["value", op.val], ["size", `${order.length}/${capacity}`]],
    });
  }

  return steps;
}
