import { SVG_TONE } from "./tones";
import type { BTreeNodeView, BTreeStep } from "@/lib/viz/types";

const CELL = 26;
const H = 24;

const nodeWidth = (n: BTreeNodeView) => Math.max(1, n.keys.length) * CELL;

/** Renders the B+tree: internal/leaf nodes (multi-key), parent→child edges, and
 *  the dashed leaf-link chain used by range scans. Tone marks the search path. */
export function BTreeCanvas({ step }: { step: BTreeStep }) {
  const byId = new Map(step.nodes.map((n) => [n.id, n]));

  return (
    <svg
      viewBox="0 0 420 208"
      className="mx-auto block w-full max-w-[440px]"
      role="img"
      aria-label="B+tree index lookup"
    >
      <defs>
        <marker
          id="bt-arrow"
          viewBox="0 0 8 8"
          refX="6"
          refY="4"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0 0 L8 4 L0 8 z" fill="#b45309" />
        </marker>
      </defs>

      {/* parent → child edges */}
      {step.edges.map(([p, c], i) => {
        const pn = byId.get(p);
        const cn = byId.get(c);
        if (!pn || !cn) return null;
        return (
          <line
            key={i}
            x1={pn.x}
            y1={pn.y + H / 2}
            x2={cn.x}
            y2={cn.y - H / 2}
            stroke="#c3b58e"
            strokeWidth={1.5}
          />
        );
      })}

      {/* leaf-link chain (dashed) */}
      {step.nodes
        .filter((n) => n.isLeaf && n.next)
        .map((n) => {
          const nx = byId.get(n.next!);
          if (!nx) return null;
          return (
            <line
              key={`lk-${n.id}`}
              x1={n.x + nodeWidth(n) / 2 + 2}
              y1={n.y}
              x2={nx.x - nodeWidth(nx) / 2 - 4}
              y2={n.y}
              stroke="#b45309"
              strokeWidth={1.4}
              strokeDasharray="3 3"
              markerEnd="url(#bt-arrow)"
              opacity={0.7}
            />
          );
        })}

      {/* nodes */}
      {step.nodes.map((n) => {
        const w = nodeWidth(n);
        const tone = SVG_TONE[n.tone ?? "idle"];
        const left = n.x - w / 2;
        return (
          <g key={n.id}>
            <rect
              x={left}
              y={n.y - H / 2}
              width={w}
              height={H}
              rx={5}
              fill={tone.fill}
              stroke={tone.stroke}
              strokeWidth={n.tone === "active" ? 2.5 : 1.5}
            />
            {n.keys.map((k, i) => (
              <g key={i}>
                {i > 0 && (
                  <line
                    x1={left + i * CELL}
                    y1={n.y - H / 2 + 3}
                    x2={left + i * CELL}
                    y2={n.y + H / 2 - 3}
                    stroke={tone.stroke}
                    strokeWidth={0.8}
                    opacity={0.5}
                  />
                )}
                <text
                  x={left + i * CELL + CELL / 2}
                  y={n.y + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontFamily="monospace"
                  fill={tone.text}
                >
                  {k}
                </text>
              </g>
            ))}
          </g>
        );
      })}

      {/* payoff footer */}
      <text
        x="210"
        y="202"
        textAnchor="middle"
        fontSize="9.5"
        fontFamily="monospace"
        fill="#7e7458"
      >
        index: {step.comparisons} node hops · full scan: {step.totalKeys} rows
      </text>
    </svg>
  );
}
