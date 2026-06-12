"use client";

import type { TrieNodeP, TrieStep } from "@/lib/viz/types";
import { SVG_TONE } from "./tones";

const R = 13;
const VGAP = 46;
const HGAP = 34;

type Placed = TrieNodeP & { x: number; y: number };

/**
 * Trie layout: leaves get consecutive x slots (left to right in insertion
 * order); every parent sits centred over its children.
 */
function layout(nodes: TrieNodeP[]): { placed: Placed[]; width: number; height: number } {
  const childrenOf = new Map<number, TrieNodeP[]>();
  for (const n of nodes) {
    if (n.parent !== null) {
      if (!childrenOf.has(n.parent)) childrenOf.set(n.parent, []);
      childrenOf.get(n.parent)!.push(n);
    }
  }
  const pos = new Map<number, { x: number; depth: number }>();
  let cursor = 0;
  let maxDepth = 0;

  function walk(n: TrieNodeP, depth: number): number {
    maxDepth = Math.max(maxDepth, depth);
    const kids = childrenOf.get(n.id) ?? [];
    let x: number;
    if (kids.length === 0) {
      x = cursor++;
    } else {
      const xs = kids.map((k) => walk(k, depth + 1));
      x = (Math.min(...xs) + Math.max(...xs)) / 2;
    }
    pos.set(n.id, { x, depth });
    return x;
  }
  const root = nodes.find((n) => n.parent === null)!;
  walk(root, 0);

  const placed = nodes.map((n) => {
    const p = pos.get(n.id)!;
    return { ...n, x: 24 + p.x * HGAP, y: 24 + p.depth * VGAP };
  });
  return {
    placed,
    width: Math.max(120, 48 + (cursor - 1) * HGAP),
    height: 52 + maxDepth * VGAP,
  };
}

export function TrieCanvas({ step }: { step: TrieStep }) {
  const { placed, width, height } = layout(step.nodes);
  const byId = new Map(placed.map((p) => [p.id, p]));

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto block"
      role="img"
      aria-label="Trie diagram"
    >
      {placed.map(
        (n) =>
          n.parent !== null && (
            <line
              key={`l${n.id}`}
              x1={byId.get(n.parent)!.x}
              y1={byId.get(n.parent)!.y}
              x2={n.x}
              y2={n.y}
              stroke="#c3b58e"
              strokeWidth={1.2}
            />
          ),
      )}
      {placed.map((n) => {
        const t = SVG_TONE[step.tones[n.id] ?? "idle"];
        return (
          <g key={n.id}>
            <circle cx={n.x} cy={n.y} r={R} fill={t.fill} stroke={t.stroke} strokeWidth={1.3} />
            {/* double ring marks "a word ends here" */}
            {n.word && (
              <circle cx={n.x} cy={n.y} r={R - 3.5} fill="none" stroke={t.stroke} strokeWidth={1} strokeDasharray="2 2" />
            )}
            <text
              x={n.x}
              y={n.y + 4}
              textAnchor="middle"
              fontSize={n.parent === null ? 9 : 12}
              fontFamily="var(--font-mono)"
              fill={t.text}
            >
              {n.parent === null ? "root" : n.ch}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
