"use client";

import type { ObserverStep } from "@/lib/viz/types";
import { SVG_TONE } from "./tones";

const SUBJECT = { x: 17, y: 32 };
const OBS_X = 80;

function obsY(i: number, n: number) {
  return n === 1 ? 32 : 10 + i * (44 / (n - 1));
}

/** Subject on the left wired to a column of observers; a publish lights up each
 * subscribed wire in turn. Unsubscribed observers sit dashed and unwired. */
export function ObserverCanvas({ step }: { step: ObserverStep }) {
  const n = step.observers.length;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        viewBox="0 0 100 64"
        className="block w-full max-w-130"
        role="img"
        aria-label="Observer fan-out diagram"
      >
        {/* wires */}
        {step.observers.map((o, i) => {
          if (!o.subscribed) return null;
          const y = obsY(i, n);
          const active = step.delivering === o.id;
          const stroke = active ? SVG_TONE.accent.stroke : "#c3b58e";
          return (
            <line
              key={`w-${o.id}`}
              x1={SUBJECT.x + 11}
              y1={SUBJECT.y}
              x2={OBS_X - 13}
              y2={y}
              stroke={stroke}
              strokeWidth={active ? 1.4 : 0.7}
            />
          );
        })}

        {/* subject */}
        <g>
          <rect
            x={SUBJECT.x - 11}
            y={SUBJECT.y - 8}
            width={22}
            height={16}
            rx={2.6}
            fill={step.publishing ? SVG_TONE.accent.fill : SVG_TONE.active.fill}
            stroke={step.publishing ? SVG_TONE.accent.stroke : SVG_TONE.active.stroke}
            strokeWidth={1}
          />
          <text
            x={SUBJECT.x}
            y={SUBJECT.y - 1}
            textAnchor="middle"
            fontSize={3.6}
            fontWeight={600}
            fontFamily="var(--font-mono)"
            fill={step.publishing ? SVG_TONE.accent.text : SVG_TONE.active.text}
          >
            Subject
          </text>
          <text
            x={SUBJECT.x}
            y={SUBJECT.y + 4.6}
            textAnchor="middle"
            fontSize={3.2}
            fontFamily="var(--font-mono)"
            fill={step.publishing ? SVG_TONE.accent.text : "#5c5440"}
          >
            {step.subjectValue === null ? "—" : `=${step.subjectValue}`}
          </text>
        </g>

        {/* observers */}
        {step.observers.map((o, i) => {
          const y = obsY(i, n);
          const tone = o.tone
            ? SVG_TONE[o.tone]
            : o.subscribed
              ? SVG_TONE.idle
              : SVG_TONE.muted;
          return (
            <g key={o.id}>
              <rect
                x={OBS_X - 13}
                y={y - 5}
                width={26}
                height={10}
                rx={2.2}
                fill={tone.fill}
                stroke={tone.stroke}
                strokeWidth={step.delivering === o.id ? 1.2 : 0.6}
                strokeDasharray={o.subscribed ? undefined : "1.6 1.4"}
              />
              <text
                x={OBS_X}
                y={y + 1.2}
                textAnchor="middle"
                fontSize={3.4}
                fontWeight={600}
                fontFamily="var(--font-mono)"
                fill={tone.text}
              >
                {o.id}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="text-[11px] text-faint">
        solid = subscribed · dashed = not listening · the subject calls the same
        method on every subscriber
      </p>
    </div>
  );
}
