import { SVG_TONE } from "./tones";
import type { HashRingStep } from "@/lib/viz/types";

const CX = 130;
const CY = 130;
const R = 92;

/** Polar → cartesian, with 0° at the top of the ring and angles going clockwise. */
function pt(angle: number, r = R) {
  const t = ((angle - 90) * Math.PI) / 180;
  return { x: CX + r * Math.cos(t), y: CY + r * Math.sin(t) };
}

/** Consistent-hashing ring: nodes + keys around a circle, with an arc from the
 *  highlighted key to the node that owns it (next clockwise). */
export function HashRingCanvas({ step }: { step: HashRingStep }) {
  const activeKey = step.keys.find((k) => k.id === step.active) ?? null;
  const owner = activeKey
    ? step.nodes.find((n) => n.id === activeKey.owner)
    : null;

  return (
    <svg
      viewBox="0 0 260 270"
      className="mx-auto block w-full max-w-[340px]"
      role="img"
      aria-label="Consistent hashing ring"
    >
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#dcd0b3" strokeWidth={2} />

      {/* arc from the active key clockwise to its owner node */}
      {activeKey &&
        owner &&
        (() => {
          const a = pt(activeKey.angle);
          const b = pt(owner.angle);
          const large =
            (owner.angle - activeKey.angle + 360) % 360 > 180 ? 1 : 0;
          return (
            <path
              d={`M ${a.x} ${a.y} A ${R} ${R} 0 ${large} 1 ${b.x} ${b.y}`}
              fill="none"
              stroke="#4f46e5"
              strokeWidth={3}
              strokeLinecap="round"
            />
          );
        })()}

      {/* keys: a dot on the ring + a label just inside */}
      {step.keys.map((k) => {
        const p = pt(k.angle);
        const lbl = pt(k.angle, R - 18);
        const tone = SVG_TONE[k.tone ?? "idle"];
        return (
          <g key={k.id}>
            <circle
              cx={p.x}
              cy={p.y}
              r={5}
              fill={tone.fill}
              stroke={tone.stroke}
              strokeWidth={2}
            />
            <text
              x={lbl.x}
              y={lbl.y + 3}
              textAnchor="middle"
              fontSize="8.5"
              fontFamily="monospace"
              fill={tone.text}
            >
              {k.id}
            </text>
          </g>
        );
      })}

      {/* nodes: a labelled chip straddling the ring */}
      {step.nodes.map((n) => {
        const p = pt(n.angle);
        const tone = SVG_TONE[n.tone ?? "idle"];
        return (
          <g key={n.id}>
            <rect
              x={p.x - 14}
              y={p.y - 11}
              width={28}
              height={22}
              rx={6}
              fill={tone.fill}
              stroke={tone.stroke}
              strokeWidth={2}
            />
            <text
              x={p.x}
              y={p.y + 4}
              textAnchor="middle"
              fontSize="11"
              fontWeight="600"
              fontFamily="monospace"
              fill={tone.text}
            >
              {n.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
