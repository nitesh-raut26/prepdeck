"use client";

import type { IntervalItem, IntervalStep } from "@/lib/viz/types";
import { SVG_TONE } from "./tones";

const LANE_H = 22;
const PAD_X = 28;

/** Timeline of interval bars; optional second lane for the built output. */
export function IntervalCanvas({ step }: { step: IntervalStep }) {
  const { intervals, output } = step;
  const all = [...intervals, ...(output ?? [])];
  const maxT = Math.max(10, ...all.map((iv) => iv.e));
  const width = 460;
  const scale = (width - PAD_X * 2) / maxT;
  const inH = intervals.length * LANE_H + 8;
  const outH = output ? (Math.max(output.length, 1) * LANE_H + 26) : 0;
  const height = 26 + inH + outH;

  const bar = (iv: IntervalItem, y: number, key: string) => {
    const t = SVG_TONE[iv.tone];
    return (
      <g key={key}>
        <rect
          x={PAD_X + iv.s * scale}
          y={y}
          width={Math.max(2, (iv.e - iv.s) * scale)}
          height={LANE_H - 7}
          rx={5}
          fill={t.fill}
          stroke={t.stroke}
          strokeWidth={1.1}
        />
        <text
          x={PAD_X + iv.s * scale + 5}
          y={y + LANE_H - 13}
          fontSize={9.5}
          fontFamily="var(--font-mono)"
          fill={t.text}
        >
          {iv.s}–{iv.e}
        </text>
      </g>
    );
  };

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="mx-auto block max-w-full"
      role="img"
      aria-label="Intervals timeline"
    >
      {/* time axis ticks */}
      {Array.from({ length: Math.floor(maxT / 2) + 1 }, (_, k) => k * 2).map((t) => (
        <g key={t}>
          <line
            x1={PAD_X + t * scale}
            y1={16}
            x2={PAD_X + t * scale}
            y2={height - 4}
            stroke="#dcd0b3"
            strokeWidth={0.7}
          />
          <text
            x={PAD_X + t * scale}
            y={11}
            textAnchor="middle"
            fontSize={8.5}
            fontFamily="var(--font-mono)"
            fill="#7e7458"
          >
            {t}
          </text>
        </g>
      ))}

      {intervals.map((iv, i) => bar(iv, 22 + i * LANE_H, `in${i}`))}

      {output && (
        <>
          <line
            x1={PAD_X - 16}
            y1={22 + inH}
            x2={width - 8}
            y2={22 + inH}
            stroke="#c3b58e"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          <text
            x={PAD_X - 16}
            y={36 + inH}
            fontSize={9}
            fontFamily="var(--font-mono)"
            fill="#7e7458"
          >
            merged
          </text>
          {output.map((iv, i) => bar(iv, 42 + inH, `out${i}`))}
        </>
      )}
    </svg>
  );
}
