"use client";

import { cn } from "@/lib/cn";
import type { SmStep, StateMachine } from "@/lib/viz/types";
import { CELL_TONE, SVG_TONE } from "./tones";

const NODE_R = 9; // half-width used to trim edge endpoints to the node border
const CURVE = 9; // bow applied to bidirectional edge pairs so they separate

/** Quadratic-Bézier edge geometry: path, end point, tangent angle, label spot. */
function edgeGeom(
  a: { x: number; y: number },
  b: { x: number; y: number },
  curve: number,
) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const ax = a.x + ux * NODE_R;
  const ay = a.y + uy * NODE_R;
  const bx = b.x - ux * NODE_R;
  const by = b.y - uy * NODE_R;
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const cx = mx + -uy * curve;
  const cy = my + ux * curve;
  const ang = (Math.atan2(by - cy, bx - cx) * 180) / Math.PI;
  const lx = 0.25 * ax + 0.5 * cx + 0.25 * bx;
  const ly = 0.25 * ay + 0.5 * cy + 0.25 * by;
  return { d: `M ${ax} ${ay} Q ${cx} ${cy} ${bx} ${by}`, bx, by, ang, lx, ly };
}

function arrowPoints(bx: number, by: number, ang: number) {
  const r = (ang * Math.PI) / 180;
  const c = Math.cos(r);
  const s = Math.sin(r);
  const len = 3;
  const w = 1.9;
  const backX = bx - c * len;
  const backY = by - s * len;
  return [
    [bx, by],
    [backX - s * w, backY + c * w],
    [backX + s * w, backY - c * w],
  ]
    .map((p) => p.map((n) => n.toFixed(1)).join(","))
    .join(" ");
}

export function StateMachineCanvas({
  machine,
  step,
}: {
  machine: StateMachine;
  step: SmStep;
}) {
  const pos = Object.fromEntries(machine.states.map((s) => [s.id, s]));
  const hasReverse = (from: string, to: string) =>
    machine.transitions.some((t) => t.from === to && t.to === from);

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 100 64"
        className="block w-full max-w-130"
        role="img"
        aria-label={`${machine.title} state diagram`}
      >
        {/* edges */}
        {machine.transitions.map((t) => {
          const a = pos[t.from];
          const b = pos[t.to];
          const curve = hasReverse(t.from, t.to)
            ? t.from < t.to
              ? CURVE
              : -CURVE
            : 0;
          const g = edgeGeom(a, b, curve);
          const isActive =
            step.active?.from === t.from &&
            step.active?.to === t.to &&
            step.active?.event === t.event;
          const stroke = isActive ? SVG_TONE.accent.stroke : "#c3b58e";
          const sw = isActive ? 1.3 : 0.7;
          return (
            <g key={`${t.from}-${t.event}-${t.to}`}>
              <path d={g.d} fill="none" stroke={stroke} strokeWidth={sw} />
              <polygon points={arrowPoints(g.bx, g.by, g.ang)} fill={stroke} />
              <rect
                x={g.lx - t.event.length * 0.92 - 1}
                y={g.ly - 2.6}
                width={t.event.length * 1.84 + 2}
                height={5}
                rx={1.4}
                fill="#faf5e9"
                stroke={isActive ? SVG_TONE.accent.stroke : "#e4dac1"}
                strokeWidth={0.3}
              />
              <text
                x={g.lx}
                y={g.ly + 1}
                textAnchor="middle"
                fontSize={3}
                fontFamily="var(--font-mono)"
                fontWeight={isActive ? 700 : 400}
                fill={isActive ? SVG_TONE.accent.text : "#5c5440"}
              >
                {t.event}
              </text>
            </g>
          );
        })}

        {/* nodes */}
        {machine.states.map((s) => {
          const isCurrent = step.current === s.id;
          const tone =
            isCurrent && step.accepted === false
              ? SVG_TONE.bad
              : isCurrent
                ? SVG_TONE.active
                : SVG_TONE.idle;
          return (
            <g key={s.id}>
              <rect
                x={s.x - 11}
                y={s.y - 6}
                width={22}
                height={12}
                rx={2.6}
                fill={tone.fill}
                stroke={tone.stroke}
                strokeWidth={isCurrent ? 1.1 : 0.6}
              />
              <text
                x={s.x}
                y={s.y + 1.4}
                textAnchor="middle"
                fontSize={3.6}
                fontWeight={600}
                fontFamily="var(--font-mono)"
                fill={tone.text}
              >
                {s.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* event timeline */}
      <div className="flex w-full max-w-130 flex-wrap items-center justify-center gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wide text-faint">
          events:
        </span>
        {step.log.length === 0 && step.upcoming.length === 0 && (
          <span className="text-xs text-faint">(none)</span>
        )}
        {step.log.map((e, i) => {
          const ignored = e.endsWith("✕");
          const isLast = i === step.log.length - 1;
          return (
            <span
              key={`log-${i}`}
              className={cn(
                "rounded-md border px-1.5 py-0.5 font-mono text-[11px]",
                ignored
                  ? CELL_TONE.bad
                  : isLast
                    ? CELL_TONE.accent
                    : CELL_TONE.good,
              )}
            >
              {e.replace("✕", "")}
            </span>
          );
        })}
        {step.upcoming.map((e, i) => (
          <span
            key={`up-${i}`}
            className="rounded-md border border-dashed border-line px-1.5 py-0.5 font-mono text-[11px] text-faint"
          >
            {e}
          </span>
        ))}
      </div>
    </div>
  );
}
