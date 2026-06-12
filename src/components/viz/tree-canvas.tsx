"use client";

import { cn } from "@/lib/cn";
import type { ArrayStep, PlainTree, Tone, TreeStep } from "@/lib/viz/types";
import { CELL_TONE, SVG_TONE } from "./tones";

const R = 14;
const VGAP = 48;
const HGAP = 40;

type Placed = { v: number; x: number; y: number; parent?: { x: number; y: number } };

/** In-order x position, depth y position — no overlaps, BST reads left→right. */
function layout(root: PlainTree | null): { nodes: Placed[]; width: number; height: number } {
  const nodes: Placed[] = [];
  let cursor = 0;
  let maxDepth = 0;

  function walk(t: PlainTree | null | undefined, depth: number, parent?: Placed): void {
    if (!t) return;
    maxDepth = Math.max(maxDepth, depth);
    const self: Placed = { v: t.v, x: 0, y: 26 + depth * VGAP };
    walk(t.l, depth + 1, self);
    self.x = 24 + cursor * HGAP;
    cursor++;
    if (parent) self.parent = { x: parent.x, y: parent.y };
    nodes.push(self);
    walk(t.r, depth + 1, self);
  }
  walk(root, 0);
  return {
    nodes,
    width: Math.max(140, 48 + cursor * HGAP),
    height: 56 + maxDepth * VGAP,
  };
}

export function TreeCanvas({ step }: { step: TreeStep }) {
  const { nodes, width, height } = layout(step.root);
  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto block"
      role="img"
      aria-label="Binary search tree diagram"
    >
      {nodes.map(
        (n) =>
          n.parent && (
            <line
              key={`l${n.v}`}
              x1={n.parent.x}
              y1={n.parent.y}
              x2={n.x}
              y2={n.y}
              stroke="#c3b58e"
              strokeWidth={1.2}
            />
          ),
      )}
      {nodes.map((n) => {
        const t = SVG_TONE[step.tones[n.v] ?? "idle"];
        return (
          <g key={n.v}>
            <circle cx={n.x} cy={n.y} r={R} fill={t.fill} stroke={t.stroke} strokeWidth={1.3} />
            <text
              x={n.x}
              y={n.y + 4}
              textAnchor="middle"
              fontSize={12}
              fontFamily="var(--font-mono)"
              fill={t.text}
            >
              {n.v}
            </text>
          </g>
        );
      })}
      {nodes.length === 0 && (
        <text x={width / 2} y={height / 2} textAnchor="middle" fontSize={12} fill="#7e7458">
          (empty tree)
        </text>
      )}
    </svg>
  );
}

/* ── Heap: array row + the complete binary tree it encodes ────────────── */

function heapPos(i: number, total: number, width: number): { x: number; y: number } {
  const level = Math.floor(Math.log2(i + 1));
  const posInLevel = i - (2 ** level - 1);
  const slots = Math.min(2 ** level, total);
  void slots;
  const x = ((posInLevel + 0.5) / 2 ** level) * width;
  return { x, y: 26 + level * VGAP };
}

export function HeapCanvas({ step }: { step: ArrayStep }) {
  const { values, tones = {} } = step;
  const levels = values.length === 0 ? 0 : Math.floor(Math.log2(values.length)) + 1;
  const width = Math.max(260, 2 ** Math.max(0, levels - 1) * 52);
  const height = Math.max(70, 56 + (levels - 1) * VGAP);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* array form */}
      <div className="flex min-w-max items-start gap-1">
        {values.map((v, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md border font-mono text-xs transition-colors",
                CELL_TONE[(tones[i] ?? "idle") as Tone],
              )}
            >
              {v}
            </div>
            <span className="font-mono text-[9px] text-faint">{i}</span>
          </div>
        ))}
        {values.length === 0 && <span className="text-xs text-faint">(empty)</span>}
      </div>

      {/* tree form */}
      {values.length > 0 && (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="block"
          role="img"
          aria-label="Heap as a complete binary tree"
        >
          {values.map((_, i) => {
            if (i === 0) return null;
            const p = heapPos(Math.floor((i - 1) / 2), values.length, width);
            const c = heapPos(i, values.length, width);
            return (
              <line
                key={`l${i}`}
                x1={p.x}
                y1={p.y}
                x2={c.x}
                y2={c.y}
                stroke="#c3b58e"
                strokeWidth={1.2}
              />
            );
          })}
          {values.map((v, i) => {
            const { x, y } = heapPos(i, values.length, width);
            const t = SVG_TONE[(tones[i] ?? "idle") as Tone];
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={R} fill={t.fill} stroke={t.stroke} strokeWidth={1.3} />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  fontSize={12}
                  fontFamily="var(--font-mono)"
                  fill={t.text}
                >
                  {v}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}
