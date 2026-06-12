"use client";

import { cn } from "@/lib/cn";
import { edgeKey, type GraphInput, type GraphStep } from "@/lib/viz/types";
import { CELL_TONE, SVG_TONE } from "./tones";

/**
 * Graph step renderer: SVG of nodes/edges coloured by tone, plus the live
 * queue / stack / priority-queue panel and (for Dijkstra) the distance table.
 */
export function GraphCanvas({ graph, step }: { graph: GraphInput; step: GraphStep }) {
  const pos = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 100 60"
        className="block w-full max-w-130"
        role="img"
        aria-label="Graph diagram"
      >
        {graph.edges.map((e) => {
          const a = pos[e.a];
          const b = pos[e.b];
          const tone = step.edgeTones[edgeKey(e.a, e.b)];
          const stroke = tone ? SVG_TONE[tone].stroke : "#c3b58e";
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          return (
            <g key={edgeKey(e.a, e.b)}>
              <line
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={stroke}
                strokeWidth={tone ? 1.1 : 0.7}
              />
              {e.w !== undefined && (
                <>
                  <circle cx={mx} cy={my} r={3.2} fill="#faf5e9" stroke="#dcd0b3" strokeWidth={0.3} />
                  <text
                    x={mx}
                    y={my + 1.2}
                    textAnchor="middle"
                    fontSize={3.4}
                    fontFamily="var(--font-mono)"
                    fill={tone ? SVG_TONE[tone].stroke : "#5c5440"}
                  >
                    {e.w}
                  </text>
                </>
              )}
            </g>
          );
        })}
        {graph.nodes.map((n) => {
          const t = SVG_TONE[step.nodeTones[n.id] ?? "idle"];
          return (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r={4.6} fill={t.fill} stroke={t.stroke} strokeWidth={0.6} />
              <text
                x={n.x}
                y={n.y + 1.6}
                textAnchor="middle"
                fontSize={4.2}
                fontWeight={600}
                fontFamily="var(--font-mono)"
                fill={t.text}
              >
                {n.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* live queue / stack / priority queue */}
      {step.aux && (
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-wide text-faint">
            {step.aux.label}:
          </span>
          {step.aux.items.length === 0 && (
            <span className="text-xs text-faint">(empty)</span>
          )}
          {step.aux.items.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className={cn(
                "rounded-md border px-1.5 py-0.5 font-mono text-[11px]",
                CELL_TONE[i === 0 ? "accent" : "idle"],
              )}
            >
              {item}
            </span>
          ))}
        </div>
      )}

      {/* distance table (Dijkstra) */}
      {step.table && (
        <div className="w-full overflow-x-auto">
          <table className="mx-auto border-collapse font-mono text-[11px]">
            <thead>
              <tr>
                {step.table.head.map((h) => (
                  <th
                    key={h}
                    className="border border-line bg-surface-3 px-2 py-1 font-semibold text-subtle"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {step.table.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className={cn(
                        "border border-line px-2 py-1 text-center",
                        cell === "∞" ? "text-faint" : "text-ink",
                      )}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
