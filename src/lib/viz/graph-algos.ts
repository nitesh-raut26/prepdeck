import { edgeKey, type GraphInput, type GraphStep, type Tone } from "./types";

/* ── Preset graphs (coordinates are SVG viewBox units, 0–100 / 0–60) ──── */

export const DEMO_GRAPH: GraphInput = {
  nodes: [
    { id: "A", x: 10, y: 30 },
    { id: "B", x: 30, y: 10 },
    { id: "C", x: 30, y: 50 },
    { id: "D", x: 52, y: 22 },
    { id: "E", x: 52, y: 50 },
    { id: "F", x: 72, y: 10 },
    { id: "G", x: 74, y: 38 },
    { id: "H", x: 92, y: 24 },
  ],
  edges: [
    { a: "A", b: "B" },
    { a: "A", b: "C" },
    { a: "B", b: "D" },
    { a: "C", b: "E" },
    { a: "D", b: "E" },
    { a: "D", b: "F" },
    { a: "E", b: "G" },
    { a: "F", b: "H" },
    { a: "G", b: "H" },
  ],
};

export const WEIGHTED_GRAPH: GraphInput = {
  nodes: DEMO_GRAPH.nodes,
  edges: [
    { a: "A", b: "B", w: 4 },
    { a: "A", b: "C", w: 2 },
    { a: "B", b: "D", w: 5 },
    { a: "C", b: "E", w: 8 },
    { a: "D", b: "E", w: 2 },
    { a: "D", b: "F", w: 6 },
    { a: "E", b: "G", w: 3 },
    { a: "F", b: "H", w: 2 },
    { a: "G", b: "H", w: 7 },
  ],
};

function neighbors(g: GraphInput, id: string): { to: string; w: number }[] {
  const out: { to: string; w: number }[] = [];
  for (const e of g.edges) {
    if (e.a === id) out.push({ to: e.b, w: e.w ?? 1 });
    else if (e.b === id) out.push({ to: e.a, w: e.w ?? 1 });
  }
  return out.sort((x, y) => x.to.localeCompare(y.to));
}

/* ── BFS ──────────────────────────────────────────────────────────────── */

export function bfsSteps(g: GraphInput, start: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const visited = new Set<string>([start]);
  const tree = new Set<string>(); // edges that discovered a node
  const queue: string[] = [start];

  const tones = (current?: string): Record<string, Tone> => {
    const t: Record<string, Tone> = {};
    for (const n of g.nodes) {
      if (current === n.id) t[n.id] = "active";
      else if (queue.includes(n.id)) t[n.id] = "accent";
      else if (visited.has(n.id)) t[n.id] = "good";
    }
    return t;
  };
  const edgeTones = (): Record<string, Tone> =>
    Object.fromEntries([...tree].map((k) => [k, "good"]));

  steps.push({
    nodeTones: tones(),
    edgeTones: {},
    note: `BFS from ${start}: visit in rings of increasing distance. A queue (FIFO) makes “closest first” automatic.`,
    aux: { label: "queue", items: [...queue] },
  });

  while (queue.length > 0) {
    const u = queue.shift()!;
    steps.push({
      nodeTones: tones(u),
      edgeTones: edgeTones(),
      note: `Dequeue ${u} — the oldest entry, so the nearest unprocessed node.`,
      aux: { label: "queue", items: [...queue] },
    });
    for (const { to } of neighbors(g, u)) {
      if (visited.has(to)) continue;
      visited.add(to);
      queue.push(to);
      tree.add(edgeKey(u, to));
      steps.push({
        nodeTones: tones(u),
        edgeTones: { ...edgeTones(), [edgeKey(u, to)]: "accent" },
        note: `Discover ${to} via ${u} — mark visited *when enqueued*, or it gets queued twice.`,
        aux: { label: "queue", items: [...queue] },
      });
    }
  }

  steps.push({
    nodeTones: tones(),
    edgeTones: edgeTones(),
    note: "Queue empty — every reachable node visited exactly once. O(V + E) time; highlighted edges form the BFS tree (shortest paths by hop count).",
    aux: { label: "queue", items: [] },
  });
  return steps;
}

/* ── DFS (iterative, explicit stack) ──────────────────────────────────── */

export function dfsSteps(g: GraphInput, start: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const visited = new Set<string>();
  const tree = new Set<string>();
  const stack: { node: string; via?: string }[] = [{ node: start }];

  const tones = (current?: string): Record<string, Tone> => {
    const t: Record<string, Tone> = {};
    const onStack = new Set(stack.map((s) => s.node));
    for (const n of g.nodes) {
      if (current === n.id) t[n.id] = "active";
      else if (visited.has(n.id)) t[n.id] = "good";
      else if (onStack.has(n.id)) t[n.id] = "accent";
    }
    return t;
  };
  const edgeTones = (): Record<string, Tone> =>
    Object.fromEntries([...tree].map((k) => [k, "good"]));

  steps.push({
    nodeTones: tones(),
    edgeTones: {},
    note: `DFS from ${start}: dive as deep as possible before backtracking. A stack (LIFO) — or recursion — drives it.`,
    aux: { label: "stack", items: stack.map((s) => s.node) },
  });

  while (stack.length > 0) {
    const { node: u, via } = stack.pop()!;
    if (visited.has(u)) {
      steps.push({
        nodeTones: tones(),
        edgeTones: edgeTones(),
        note: `Pop ${u} — already visited via another path, skip it.`,
        aux: { label: "stack", items: stack.map((s) => s.node) },
      });
      continue;
    }
    visited.add(u);
    if (via) tree.add(edgeKey(via, u));
    steps.push({
      nodeTones: tones(u),
      edgeTones: edgeTones(),
      note: `Pop ${u} and visit it${via ? ` (reached from ${via})` : ""} — newest first, so we go deeper, not wider.`,
      aux: { label: "stack", items: stack.map((s) => s.node) },
    });
    const nbrs = neighbors(g, u).filter(({ to }) => !visited.has(to));
    // Push in reverse so alphabetical order is explored first.
    for (const { to } of [...nbrs].reverse()) stack.push({ node: to, via: u });
    if (nbrs.length > 0) {
      steps.push({
        nodeTones: tones(u),
        edgeTones: edgeTones(),
        note: `Push unvisited neighbours of ${u}: ${nbrs.map((n) => n.to).join(", ")}.`,
        aux: { label: "stack", items: stack.map((s) => s.node) },
      });
    } else {
      steps.push({
        nodeTones: tones(u),
        edgeTones: edgeTones(),
        note: `${u} has no unvisited neighbours — dead end, backtrack (pop the next item).`,
        aux: { label: "stack", items: stack.map((s) => s.node) },
      });
    }
  }

  steps.push({
    nodeTones: tones(),
    edgeTones: edgeTones(),
    note: "Stack empty — traversal complete in O(V + E). Compare the path shape with BFS: long tendrils instead of rings.",
    aux: { label: "stack", items: [] },
  });
  return steps;
}

/* ── Dijkstra ─────────────────────────────────────────────────────────── */

export function dijkstraSteps(g: GraphInput, start: string): GraphStep[] {
  const steps: GraphStep[] = [];
  const dist = new Map<string, number>(g.nodes.map((n) => [n.id, Infinity]));
  const prev = new Map<string, string>();
  const done = new Set<string>();
  dist.set(start, 0);

  const ids = g.nodes.map((n) => n.id);
  const fmt = (d: number) => (d === Infinity ? "∞" : d);
  const table = (): GraphStep["table"] => ({
    head: ["node", ...ids],
    rows: [["dist", ...ids.map((id) => fmt(dist.get(id)!))]],
  });
  const pq = (): string[] =>
    ids
      .filter((id) => !done.has(id) && dist.get(id)! < Infinity)
      .sort((a, b) => dist.get(a)! - dist.get(b)!)
      .map((id) => `${id}:${dist.get(id)}`);
  const tones = (current?: string): Record<string, Tone> => {
    const t: Record<string, Tone> = {};
    for (const id of ids) {
      if (id === current) t[id] = "active";
      else if (done.has(id)) t[id] = "good";
      else if (dist.get(id)! < Infinity) t[id] = "accent";
    }
    return t;
  };
  const treeEdges = (): Record<string, Tone> =>
    Object.fromEntries(
      [...prev.entries()]
        .filter(([v]) => done.has(v))
        .map(([v, u]) => [edgeKey(u, v), "good"]),
    );

  steps.push({
    nodeTones: tones(),
    edgeTones: {},
    note: `Dijkstra from ${start}: dist[${start}] = 0, everything else ∞. Always settle the cheapest unsettled node next — greedy works because weights are non-negative.`,
    aux: { label: "priority queue", items: pq() },
    table: table(),
  });

  for (;;) {
    let u: string | null = null;
    for (const id of ids) {
      if (!done.has(id) && dist.get(id)! < Infinity && (u === null || dist.get(id)! < dist.get(u)!)) {
        u = id;
      }
    }
    if (u === null) break;
    done.add(u);

    steps.push({
      nodeTones: tones(u),
      edgeTones: treeEdges(),
      note: `Settle ${u} at distance ${dist.get(u)} — the smallest tentative distance, so no other path can beat it.`,
      aux: { label: "priority queue", items: pq() },
      table: table(),
    });

    for (const { to, w } of neighbors(g, u)) {
      if (done.has(to)) continue;
      const cand = dist.get(u)! + w;
      if (cand < dist.get(to)!) {
        const old = dist.get(to)!;
        dist.set(to, cand);
        prev.set(to, u);
        steps.push({
          nodeTones: tones(u),
          edgeTones: { ...treeEdges(), [edgeKey(u, to)]: "accent" },
          note: `Relax ${u}→${to}: ${dist.get(u)} + ${w} = ${cand} ${old === Infinity ? "improves ∞" : `< ${old}`} — update dist[${to}].`,
          aux: { label: "priority queue", items: pq() },
          table: table(),
        });
      } else {
        steps.push({
          nodeTones: tones(u),
          edgeTones: { ...treeEdges(), [edgeKey(u, to)]: "bad" },
          note: `Relax ${u}→${to}: ${dist.get(u)} + ${w} = ${cand} ≥ ${fmt(dist.get(to)!)} — no improvement, keep the old path.`,
          aux: { label: "priority queue", items: pq() },
          table: table(),
        });
      }
    }
  }

  steps.push({
    nodeTones: tones(),
    edgeTones: treeEdges(),
    note: "All reachable nodes settled — the table holds true shortest distances and highlighted edges form the shortest-path tree. With a binary heap: O((V + E) log V).",
    aux: { label: "priority queue", items: [] },
    table: table(),
  });
  return steps;
}

/** Final distances (for tests). */
export function dijkstraDistances(g: GraphInput, start: string): Record<string, number> {
  const dist = new Map<string, number>(g.nodes.map((n) => [n.id, Infinity]));
  const done = new Set<string>();
  dist.set(start, 0);
  for (;;) {
    let u: string | null = null;
    for (const n of g.nodes) {
      if (!done.has(n.id) && dist.get(n.id)! < Infinity && (u === null || dist.get(n.id)! < dist.get(u)!)) {
        u = n.id;
      }
    }
    if (u === null) break;
    done.add(u);
    for (const { to, w } of neighbors(g, u)) {
      if (!done.has(to) && dist.get(u)! + w < dist.get(to)!) dist.set(to, dist.get(u)! + w);
    }
  }
  return Object.fromEntries(dist);
}
