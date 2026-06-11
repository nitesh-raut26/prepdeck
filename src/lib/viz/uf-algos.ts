import type { Tone, UfStep } from "./types";

export type UfOp = { kind: "union" | "find"; a: number; b?: number };

/** Parse "union 0 1, union 2 3, find 3". */
export function parseUfOps(text: string, n: number): UfOp[] {
  return text
    .split(/[,\n;]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .flatMap((s): UfOp[] => {
      const u = s.match(/^union\s+(\d+)\s+(\d+)$/i);
      if (u) {
        const a = Number(u[1]);
        const b = Number(u[2]);
        return a < n && b < n ? [{ kind: "union", a, b }] : [];
      }
      const f = s.match(/^find\s+(\d+)$/i);
      if (f && Number(f[1]) < n) return [{ kind: "find", a: Number(f[1]) }];
      return [];
    })
    .slice(0, 12);
}

/**
 * Union-Find, jargon-free: each item carries a sticky note saying who its
 * "boss" is. Follow boss notes upward and you reach the group's leader
 * (someone who is their own boss). Two items are in the same group exactly
 * when they share a leader. union = make one leader report to the other;
 * find = walk to the leader (and, as a bonus, re-stick everyone's note
 * directly onto the leader so next time is one hop — "path compression").
 */
export function unionFindSteps(n: number, ops: UfOp[]): UfStep[] {
  n = Math.max(4, Math.min(n, 10));
  const parent = Array.from({ length: n }, (_, i) => i);
  const steps: UfStep[] = [];
  const snap = (tones: Record<number, Tone>, note: string, vars?: UfStep["vars"]) =>
    steps.push({ parent: [...parent], tones, note, vars });

  snap({}, `${n} items, ${n} groups: everyone starts as their own leader (each arrow points to itself).`);

  function findRoot(x: number, label: string): number {
    const path: number[] = [x];
    while (parent[path[path.length - 1]] !== path[path.length - 1]) {
      path.push(parent[path[path.length - 1]]);
    }
    const root = path[path.length - 1];
    if (path.length > 1) {
      snap(
        Object.fromEntries(path.map((p) => [p, p === root ? "good" : "focus"])),
        `${label}: follow the boss notes from ${x}: ${path.join(" → ")}. Leader = ${root}.`,
        [["leader", root]],
      );
    } else {
      snap({ [x]: "good" }, `${label}: ${x} is its own leader already.`, [["leader", root]]);
    }
    // Path compression
    if (path.length > 2) {
      for (const p of path) if (p !== root) parent[p] = root;
      snap(
        Object.fromEntries(path.map((p) => [p, p === root ? "good" : "accent"])),
        `Path compression: while we're here, re-point ${path.slice(0, -1).join(", ")} straight at ${root}. The chain we just walked will never need walking again.`,
      );
    }
    return root;
  }

  for (const op of ops) {
    if (op.kind === "find") {
      findRoot(op.a, `find(${op.a})`);
      continue;
    }
    const b = op.b!;
    const ra = findRoot(op.a, `union(${op.a}, ${b}) — first, ${op.a}'s leader`);
    const rb = findRoot(b, `…and ${b}'s leader`);
    if (ra === rb) {
      snap(
        { [ra]: "accent" },
        `Both already report to ${ra} — same group, nothing to do. (In cycle detection, THIS is the moment you've found a cycle.)`,
      );
      continue;
    }
    parent[ra] = rb;
    snap(
      { [ra]: "active", [rb]: "good" },
      `Different groups: make leader ${ra} report to leader ${rb}. Two groups become one — and only one arrow changed.`,
      [["merged", `${ra} → ${rb}`]],
    );
  }

  const roots = parent.filter((p, i) => p === i);
  snap(
    Object.fromEntries(roots.map((r) => [r, "good"])) as Record<number, Tone>,
    `Done: ${roots.length} group${roots.length === 1 ? "" : "s"} remain (leaders: ${roots.join(", ")}). With path compression, find/union cost is effectively constant — this powers Kruskal's MST and "are these connected?" at scale.`,
  );
  return steps;
}
