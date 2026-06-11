import type { BoxesStep, ListStep, PlainTree, TreeStep, Tone } from "./types";

/* ── Stack & queue ────────────────────────────────────────────────────── */

export type BoxOp = { kind: "push" | "pop"; value?: number };

/** Parse "push 3, push 7, pop" (queue mode accepts enqueue/dequeue too). */
export function parseOps(text: string): BoxOp[] {
  return text
    .split(/[,\n;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .flatMap((s): BoxOp[] => {
      const m = s.match(/^(push|enqueue|add)\s+(-?\d+)$/i);
      if (m) return [{ kind: "push", value: Number(m[2]) }];
      if (/^(pop|dequeue|remove)$/i.test(s)) return [{ kind: "pop" }];
      return [];
    })
    .slice(0, 20);
}

export function stackSteps(ops: BoxOp[]): BoxesStep[] {
  const items: number[] = [];
  const steps: BoxesStep[] = [
    { items: [], note: "Empty stack. push adds to the top; pop removes from the top (LIFO)." },
  ];
  for (const op of ops) {
    if (op.kind === "push" && op.value !== undefined) {
      items.push(op.value);
      steps.push({
        items: [...items],
        tones: { [items.length - 1]: "good" },
        note: `push(${op.value}) — ${op.value} is now the top. O(1).`,
      });
    } else if (op.kind === "pop") {
      if (items.length === 0) {
        steps.push({ items: [], note: "pop() on an empty stack — underflow! Real code must guard this." });
      } else {
        const v = items[items.length - 1];
        steps.push({
          items: [...items],
          tones: { [items.length - 1]: "bad" },
          note: `pop() removes the top: ${v}. The element below becomes the new top.`,
        });
        items.pop();
        steps.push({ items: [...items], note: `Stack after pop: [${items.join(", ")}].` });
      }
    }
  }
  return steps;
}

export function queueSteps(ops: BoxOp[]): BoxesStep[] {
  const items: number[] = [];
  const steps: BoxesStep[] = [
    { items: [], note: "Empty queue. enqueue adds at the back; dequeue removes from the front (FIFO)." },
  ];
  for (const op of ops) {
    if (op.kind === "push" && op.value !== undefined) {
      items.push(op.value);
      steps.push({
        items: [...items],
        tones: { [items.length - 1]: "good" },
        note: `enqueue(${op.value}) joins the back of the line. O(1).`,
      });
    } else if (op.kind === "pop") {
      if (items.length === 0) {
        steps.push({ items: [], note: "dequeue() on an empty queue — nothing to serve." });
      } else {
        const v = items[0];
        steps.push({
          items: [...items],
          tones: { 0: "bad" },
          note: `dequeue() serves the front: ${v} — first in, first out.`,
        });
        items.shift();
        steps.push({ items: [...items], note: `Queue after dequeue: [${items.join(", ")}].` });
      }
    }
  }
  return steps;
}

/* ── Linked list reversal ─────────────────────────────────────────────── */

export function reverseListSteps(values: number[]): ListStep[] {
  const nodes = values.map((value, id) => ({ id, value }));
  // next[i] starts as i+1 (memory order == list order initially).
  const next: Record<number, number | null> = {};
  nodes.forEach((n, i) => (next[n.id] = i < nodes.length - 1 ? i + 1 : null));

  const snap = (
    head: number | null,
    pointers: ListStep["pointers"],
    note: string,
  ): ListStep => ({
    nodes,
    next: { ...next },
    head,
    pointers,
    note,
  });

  const steps: ListStep[] = [];
  let prev: number | null = null;
  let curr: number | null = nodes.length > 0 ? 0 : null;

  steps.push(
    snap(curr, [
      { label: "prev", at: null, tone: "muted" },
      { label: "curr", at: curr, tone: "active" },
    ], "Three pointers: prev starts at ∅, curr at head. We flip one arrow per step."),
  );

  while (curr !== null) {
    const nxt: number | null = next[curr];
    steps.push(
      snap(prev ?? curr, [
        { label: "prev", at: prev, tone: "muted" },
        { label: "curr", at: curr, tone: "active" },
        { label: "next", at: nxt, tone: "focus" },
      ], `Save next = ${nxt === null ? "∅" : `node(${nodes[nxt].value})`} before we overwrite curr.next — otherwise the rest of the list is lost.`),
    );

    next[curr] = prev;
    steps.push(
      snap(curr, [
        { label: "prev", at: prev, tone: "muted" },
        { label: "curr", at: curr, tone: "good" },
        { label: "next", at: nxt, tone: "focus" },
      ], `Flip the arrow: node(${nodes[curr].value}).next now points ${prev === null ? "to ∅" : `back to node(${nodes[prev].value})`}.`),
    );

    prev = curr;
    curr = nxt;
    steps.push(
      snap(prev, [
        { label: "prev", at: prev, tone: "good" },
        { label: "curr", at: curr, tone: "active" },
      ], curr === null
        ? "curr reached ∅ — every arrow is flipped."
        : `Advance: prev → node(${nodes[prev].value}), curr → node(${nodes[curr].value}).`),
    );
  }

  steps.push(
    snap(prev, [{ label: "head", at: prev, tone: "good" }],
      "Done: prev is the new head. O(n) time, O(1) extra space — no copy of the list needed."),
  );
  return steps;
}

/* ── Binary search tree ───────────────────────────────────────────────── */

type MutableTree = { v: number; l: MutableTree | null; r: MutableTree | null };

function cloneTree(t: MutableTree | null): PlainTree | null {
  if (!t) return null;
  return { v: t.v, l: cloneTree(t.l), r: cloneTree(t.r) };
}

export function bstSteps(values: number[], target: number): TreeStep[] {
  const steps: TreeStep[] = [];
  let root: MutableTree | null = null;
  const seen = new Set<number>();

  for (const v of values) {
    if (seen.has(v)) continue; // demo trees keep values unique
    seen.add(v);
    if (!root) {
      root = { v, l: null, r: null };
      steps.push({
        root: cloneTree(root),
        tones: { [v]: "good" },
        note: `Insert ${v} — empty tree, so it becomes the root.`,
      });
      continue;
    }
    let node = root;
    const path: number[] = [];
    for (;;) {
      path.push(node.v);
      steps.push({
        root: cloneTree(root),
        tones: Object.fromEntries([...path.map((p) => [p, "focus"]), [node.v, "active"]]) as Record<number, Tone>,
        note: `Insert ${v}: compare with ${node.v} → go ${v < node.v ? "left (smaller)" : "right (larger)"}.`,
        vars: [["inserting", v]],
      });
      if (v < node.v) {
        if (!node.l) { node.l = { v, l: null, r: null }; break; }
        node = node.l;
      } else {
        if (!node.r) { node.r = { v, l: null, r: null }; break; }
        node = node.r;
      }
    }
    steps.push({
      root: cloneTree(root),
      tones: { [v]: "good" },
      note: `${v} attached as a leaf. BST invariant holds: left subtree < node < right subtree.`,
    });
  }

  // Search phase.
  steps.push({
    root: cloneTree(root),
    tones: {},
    note: `Tree built. Now search for ${target} — each comparison discards a whole subtree.`,
    vars: [["target", target]],
  });
  let node = root;
  let hops = 0;
  while (node) {
    hops++;
    if (node.v === target) {
      steps.push({
        root: cloneTree(root),
        tones: { [node.v]: "good" },
        note: `Found ${target} in ${hops} comparison${hops === 1 ? "" : "s"}. A balanced BST keeps this at O(log n).`,
      });
      return steps;
    }
    steps.push({
      root: cloneTree(root),
      tones: { [node.v]: "active" },
      note: `${target} ${target < node.v ? "<" : ">"} ${node.v} → ${target < node.v ? "left" : "right"} subtree only; the other side can’t contain it.`,
      vars: [["target", target], ["comparisons", hops]],
    });
    node = target < node.v ? node.l : node.r;
  }
  steps.push({
    root: cloneTree(root),
    tones: {},
    note: `Hit a null child — ${target} is not in the tree (${hops} comparisons).`,
  });
  return steps;
}

/* ── Tree traversals ──────────────────────────────────────────────────── */

export type TraversalKind = "inorder" | "preorder" | "postorder" | "level";

const TRAVERSAL_INTRO: Record<TraversalKind, string> = {
  inorder:
    "In-order: visit the left side, then the node itself, then the right side. On a BST this reads values smallest → largest — sorted for free.",
  preorder:
    "Pre-order: note the node FIRST, then go left, then right. 'Write down the room before opening its doors' — this order can rebuild the exact tree, so it's used for copying/serializing.",
  postorder:
    "Post-order: handle both children before the node itself. 'Empty the rooms before demolishing the floor' — used to delete trees and compute sizes bottom-up.",
  level:
    "Level-order: visit floor by floor, left to right, driven by a queue — this is just BFS wearing a tree costume.",
};

/** Build a BST quietly, then step through one traversal of it. */
export function traversalSteps(values: number[], kind: TraversalKind): TreeStep[] {
  let root: MutableTree | null = null;
  const seen = new Set<number>();
  for (const v of values) {
    if (seen.has(v)) continue;
    seen.add(v);
    if (!root) {
      root = { v, l: null, r: null };
      continue;
    }
    let node = root;
    for (;;) {
      if (v < node.v) {
        if (!node.l) { node.l = { v, l: null, r: null }; break; }
        node = node.l;
      } else {
        if (!node.r) { node.r = { v, l: null, r: null }; break; }
        node = node.r;
      }
    }
  }

  const steps: TreeStep[] = [];
  const out: number[] = [];
  const visited: Record<number, Tone> = {};
  const snap = (extra: Record<number, Tone>, note: string, alsoVars: [string, string | number][] = []) =>
    steps.push({
      root: cloneTree(root),
      tones: { ...visited, ...extra },
      note,
      vars: [["output", out.length > 0 ? out.join(" ") : "—"], ...alsoVars],
    });

  snap({}, TRAVERSAL_INTRO[kind]);

  function emit(v: number, why: string) {
    out.push(v);
    visited[v] = "good";
    snap({ [v]: "good" }, why);
  }

  function inorder(t: MutableTree | null) {
    if (!t) return;
    if (t.l) snap({ [t.v]: "focus" }, `At ${t.v}: left side first — dive to ${t.l.v}.`);
    inorder(t.l);
    emit(t.v, `Left side of ${t.v} is done (or empty) — NOW output ${t.v}.`);
    if (t.r) snap({ [t.v]: "focus" }, `${t.v} is recorded — now its right side.`);
    inorder(t.r);
  }
  function preorder(t: MutableTree | null) {
    if (!t) return;
    emit(t.v, `Arrive at ${t.v} — output immediately, then explore below.`);
    preorder(t.l);
    preorder(t.r);
  }
  function postorder(t: MutableTree | null) {
    if (!t) return;
    snap({ [t.v]: "focus" }, `At ${t.v}: children first, ${t.v} waits.`);
    postorder(t.l);
    postorder(t.r);
    emit(t.v, `Both sides under ${t.v} are finished — finally output ${t.v}.`);
  }
  function levelorder(t: MutableTree | null) {
    if (!t) return;
    const q: MutableTree[] = [t];
    snap({ [t.v]: "accent" }, `Queue starts with the root (${t.v}).`, [["queue", t.v]]);
    while (q.length > 0) {
      const node = q.shift()!;
      emit(node.v, `Dequeue ${node.v} and output it; its children join the back of the queue.`);
      for (const child of [node.l, node.r]) {
        if (child) {
          q.push(child);
          snap({ [child.v]: "accent" }, `Enqueue ${child.v} — it'll be visited after everything already waiting.`, [["queue", q.map((x) => x.v).join(" ")]]);
        }
      }
    }
  }

  if (kind === "inorder") inorder(root);
  else if (kind === "preorder") preorder(root);
  else if (kind === "postorder") postorder(root);
  else levelorder(root);

  snap(
    {},
    kind === "inorder"
      ? `Done: ${out.join(", ")} — sorted, because in a BST "left < node < right" at every step. Every node visited once: O(n).`
      : `Done: ${out.join(", ")}. Every node visited exactly once — O(n) for any traversal; they differ only in WHEN each node speaks.`,
  );
  return steps;
}

/* ── Binary min-heap (array-backed) ───────────────────────────────────── */

import type { ArrayStep } from "./types";

export function heapSteps(values: number[]): ArrayStep[] {
  const heap: number[] = [];
  const steps: ArrayStep[] = [
    { values: [], note: "Min-heap stored in an array: parent of i is ⌊(i−1)/2⌋, children are 2i+1 and 2i+2. Parent ≤ children, always." },
  ];

  for (const v of values) {
    heap.push(v);
    let i = heap.length - 1;
    steps.push({
      values: [...heap],
      tones: { [i]: "active" },
      note: `push(${v}): append at the end, then sift up while smaller than its parent.`,
    });
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p] <= heap[i]) {
        steps.push({
          values: [...heap],
          tones: { [i]: "good", [p]: "focus" },
          note: `Parent ${heap[p]} ≤ ${heap[i]} — heap property holds, stop sifting.`,
        });
        break;
      }
      [heap[p], heap[i]] = [heap[i], heap[p]];
      steps.push({
        values: [...heap],
        tones: { [p]: "accent", [i]: "accent" },
        note: `${heap[p]} < parent ${heap[i]} — swap up. At most O(log n) swaps (tree height).`,
      });
      i = p;
    }
  }

  if (heap.length > 1) {
    steps.push({
      values: [...heap],
      tones: { 0: "good" },
      note: `Heap built — the minimum (${heap[0]}) sits at the root. Now extract it.`,
    });
    const min = heap[0];
    heap[0] = heap[heap.length - 1];
    heap.pop();
    steps.push({
      values: [...heap],
      tones: { 0: "active" },
      note: `extractMin removed ${min}; the last element ${heap[0]} moved to the root and must sift down.`,
    });
    let i = 0;
    for (;;) {
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      let smallest = i;
      if (l < heap.length && heap[l] < heap[smallest]) smallest = l;
      if (r < heap.length && heap[r] < heap[smallest]) smallest = r;
      if (smallest === i) {
        steps.push({
          values: [...heap],
          tones: { [i]: "good" },
          note: "No child is smaller — heap restored.",
        });
        break;
      }
      [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
      steps.push({
        values: [...heap],
        tones: { [i]: "accent", [smallest]: "accent" },
        note: `Swap with the smaller child (${heap[i]}) and keep sifting down.`,
      });
      i = smallest;
    }
    steps.push({
      values: [...heap],
      tones: { 0: "good" },
      note: `New minimum at the root: ${heap[0]}. Every push/extract is O(log n) — the engine behind priority queues, Dijkstra and heapsort.`,
    });
  }
  return steps;
}
