"use client";

import { cn } from "@/lib/cn";
import type { Tone, UfStep } from "@/lib/viz/types";
import { CELL_TONE, SVG_TONE } from "./tones";

const R = 13;
const VGAP = 44;
const HGAP = 36;

/**
 * Union-Find as a forest (arrows point child → boss) plus the raw
 * parent[] array underneath — the whole structure IS that one array.
 */
export function UfCanvas({ step }: { step: UfStep }) {
  const { parent, tones = {} } = step;
  const n = parent.length;

  // Forest layout: leaves get x slots, parents centre over children.
  const childrenOf = new Map<number, number[]>();
  const roots: number[] = [];
  for (let i = 0; i < n; i++) {
    if (parent[i] === i) roots.push(i);
    else {
      if (!childrenOf.has(parent[i])) childrenOf.set(parent[i], []);
      childrenOf.get(parent[i])!.push(i);
    }
  }
  const pos = new Map<number, { x: number; depth: number }>();
  let cursor = 0;
  let maxDepth = 0;
  function walk(v: number, depth: number): number {
    maxDepth = Math.max(maxDepth, depth);
    const kids = childrenOf.get(v) ?? [];
    let x: number;
    if (kids.length === 0) x = cursor++;
    else {
      const xs = kids.map((k) => walk(k, depth + 1));
      x = (Math.min(...xs) + Math.max(...xs)) / 2;
    }
    pos.set(v, { x, depth });
    return x;
  }
  for (const r of roots) {
    walk(r, 0);
    cursor += 0.4; // small gap between trees
  }

  const X = (v: number) => 24 + pos.get(v)!.x * HGAP;
  const Y = (v: number) => 24 + pos.get(v)!.depth * VGAP;
  const width = Math.max(160, 48 + (cursor - 0.4) * HGAP);
  const height = 52 + maxDepth * VGAP;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="block"
        role="img"
        aria-label="Union-Find forest"
      >
        {Array.from({ length: n }, (_, i) =>
          parent[i] !== i ? (
            <line
              key={`e${i}`}
              x1={X(i)}
              y1={Y(i) - R}
              x2={X(parent[i])}
              y2={Y(parent[i]) + R - 2}
              stroke="#324056"
              strokeWidth={1.2}
            />
          ) : null,
        )}
        {Array.from({ length: n }, (_, i) => {
          const t = SVG_TONE[(tones[i] ?? (parent[i] === i ? "focus" : "idle")) as Tone];
          return (
            <g key={i}>
              <circle cx={X(i)} cy={Y(i)} r={R} fill={t.fill} stroke={t.stroke} strokeWidth={1.3} />
              <text
                x={X(i)}
                y={Y(i) + 4}
                textAnchor="middle"
                fontSize={12}
                fontFamily="var(--font-mono)"
                fill={t.text}
              >
                {i}
              </text>
            </g>
          );
        })}
      </svg>

      {/* parent[] array */}
      <div className="flex items-start gap-1">
        <span className="mr-1 mt-2 font-mono text-[10px] text-faint">parent</span>
        {parent.map((p, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md border font-mono text-xs transition-colors",
                CELL_TONE[tones[i] ?? "idle"],
              )}
            >
              {p}
            </div>
            <span className="font-mono text-[9px] text-faint">{i}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
