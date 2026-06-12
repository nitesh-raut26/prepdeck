"use client";

import { useId } from "react";
import type { ListStep } from "@/lib/viz/types";
import { SVG_TONE } from "./tones";

const NODE_W = 56;
const NODE_H = 34;
const GAP = 40;
const TOP = 42;

/**
 * Linked list as SVG. Nodes sit in fixed "memory order"; the `next` arrows
 * are what move. Forward arrows run straight between nodes; backward arrows
 * (created during reversal) curve underneath in green so the flip is visible.
 */
export function ListCanvas({ step }: { step: ListStep }) {
  const markerId = useId().replace(/[^a-zA-Z0-9]/g, "");
  const { nodes, next, head, pointers } = step;
  const n = nodes.length;
  const width = 24 + n * (NODE_W + GAP);
  const height = 168;

  const x = (id: number) => 16 + id * (NODE_W + GAP);
  const cy = TOP + NODE_H / 2;

  const toneFor = (id: number) => {
    const p = pointers.find((p) => p.at === id && p.tone);
    return SVG_TONE[p?.tone ?? "idle"];
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto block"
      role="img"
      aria-label="Linked list diagram"
    >
      <defs>
        <marker
          id={`arr-${markerId}`}
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L8,4 L0,8 z" fill="#7e7458" />
        </marker>
        <marker
          id={`arrg-${markerId}`}
          viewBox="0 0 8 8"
          refX="7"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L8,4 L0,8 z" fill="#059669" />
        </marker>
      </defs>

      {/* head marker */}
      {head !== null && (
        <g>
          <text
            x={x(head) + NODE_W / 2}
            y={14}
            textAnchor="middle"
            fontSize={11}
            fontFamily="var(--font-mono)"
            fill="#4f46e5"
          >
            head
          </text>
          <line
            x1={x(head) + NODE_W / 2}
            y1={18}
            x2={x(head) + NODE_W / 2}
            y2={TOP - 4}
            stroke="#4f46e5"
            strokeWidth={1.2}
            markerEnd={`url(#arr-${markerId})`}
          />
        </g>
      )}

      {/* next arrows */}
      {nodes.map((node) => {
        const to = next[node.id];
        const fromX = x(node.id) + NODE_W;
        if (to === null) {
          // points to ∅: short stub with a ground symbol
          return (
            <g key={`e${node.id}`}>
              <line
                x1={fromX}
                y1={cy}
                x2={fromX + 18}
                y2={cy}
                stroke="#7e7458"
                strokeWidth={1.2}
                markerEnd={`url(#arr-${markerId})`}
              />
              <text
                x={fromX + 26}
                y={cy + 4}
                fontSize={12}
                fill="#7e7458"
                fontFamily="var(--font-mono)"
              >
                ∅
              </text>
            </g>
          );
        }
        if (to > node.id) {
          return (
            <line
              key={`e${node.id}`}
              x1={fromX}
              y1={cy}
              x2={x(to) - 3}
              y2={cy}
              stroke="#7e7458"
              strokeWidth={1.2}
              markerEnd={`url(#arr-${markerId})`}
            />
          );
        }
        // backward arrow (reversed link) — curve underneath, green
        const sx = x(node.id) + NODE_W / 2;
        const tx = x(to) + NODE_W / 2;
        const by = TOP + NODE_H;
        return (
          <path
            key={`e${node.id}`}
            d={`M ${sx} ${by} C ${sx} ${by + 26}, ${tx} ${by + 26}, ${tx} ${by + 4}`}
            fill="none"
            stroke="#059669"
            strokeWidth={1.2}
            markerEnd={`url(#arrg-${markerId})`}
          />
        );
      })}

      {/* nodes */}
      {nodes.map((node) => {
        const t = toneFor(node.id);
        return (
          <g key={node.id}>
            <rect
              x={x(node.id)}
              y={TOP}
              width={NODE_W}
              height={NODE_H}
              rx={8}
              fill={t.fill}
              stroke={t.stroke}
              strokeWidth={1.2}
            />
            <text
              x={x(node.id) + NODE_W / 2}
              y={TOP + NODE_H / 2 + 4}
              textAnchor="middle"
              fontSize={13}
              fontFamily="var(--font-mono)"
              fill={t.text}
            >
              {node.value}
            </text>
          </g>
        );
      })}

      {/* pointer labels under their nodes (∅ pointers listed bottom-left) */}
      {pointers.some((p) => p.at === null) && (
        <text
          x={12}
          y={height - 10}
          fontSize={11}
          fontFamily="var(--font-mono)"
          fill="#7e7458"
        >
          {pointers
            .filter((q) => q.at === null)
            .map((q) => `${q.label} → ∅`)
            .join("   ")}
        </text>
      )}
      {pointers.map((p, i) => {
        if (p.at === null) return null;
        return (
          <text
            key={p.label}
            x={x(p.at) + NODE_W / 2}
            y={TOP + NODE_H + 38 + (i % 2) * 13}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fontFamily="var(--font-mono)"
            fill={SVG_TONE[p.tone ?? "active"].stroke}
          >
            ▲ {p.label}
          </text>
        );
      })}
    </svg>
  );
}
