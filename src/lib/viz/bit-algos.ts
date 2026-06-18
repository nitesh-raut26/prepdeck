import type { DpStep, Tone } from "./types";

/**
 * Bitwise operators visualized column by column. Reuses the DP table canvas:
 * three rows (a, b, result) over 8 bit-columns, MSB on the left. Each step
 * resolves one column, because AND/OR/XOR treat every bit independently.
 */

export type BitOp = "and" | "or" | "xor";

const WIDTH = 8;
const k = (r: number, c: number) => `${r},${c}`;

/** Bits of x, index 0 = most-significant (bit WIDTH-1), last = LSB (bit 0). */
function bits(x: number): string[] {
  return Array.from({ length: WIDTH }, (_, j) => String((x >> (WIDTH - 1 - j)) & 1));
}

const RULE: Record<BitOp, string> = {
  and: "A result bit is 1 only when BOTH inputs are 1 — the masking / testing operator.",
  or: "A result bit is 1 when EITHER input is 1 — the setting operator.",
  xor: "A result bit is 1 only when the inputs DIFFER — the toggling / cancelling operator.",
};

const PAYOFF: Record<BitOp, string> = {
  and: "Useful forms: x & 1 tests odd/even; x & (x − 1) clears the lowest set bit (count bits); x & −x isolates it.",
  or: "Useful form: x | (1 << k) sets bit k without disturbing any other bit.",
  xor: "Useful facts: a ^ a = 0 and a ^ 0 = a — the engine behind 'find the single number' and swap-without-a-temp.",
};

export function bitwiseSteps(a: number, b: number, op: BitOp): DpStep[] {
  a = Math.max(0, Math.min(Math.trunc(a) || 0, 255));
  b = Math.max(0, Math.min(Math.trunc(b) || 0, 255));
  const sym = op === "and" ? "&" : op === "or" ? "|" : "^";
  const word = op === "and" ? "AND" : op === "or" ? "OR" : "XOR";
  const A = bits(a);
  const B = bits(b);
  const R: (string | null)[] = Array(WIDTH).fill(null);
  const colLabels = Array.from({ length: WIDTH }, (_, j) => String(WIDTH - 1 - j));
  const rowLabels = ["a", "b", `a ${sym} b`];
  const grid = (): (string | null)[][] => [[...A], [...B], [...R]];
  const steps: DpStep[] = [];

  steps.push({
    grid: grid(),
    rowLabels,
    colLabels,
    note: `${word} of a = ${a} and b = ${b}, one bit-column at a time (bit 7 is most significant, bit 0 least). ${RULE[op]} Columns are independent, so we just walk left to right.`,
    vars: [["a", a], ["b", b]],
  });

  for (let j = 0; j < WIDTH; j++) {
    const ab = A[j];
    const bb = B[j];
    const rbit =
      op === "and"
        ? ab === "1" && bb === "1" ? "1" : "0"
        : op === "or"
          ? ab === "1" || bb === "1" ? "1" : "0"
          : ab !== bb ? "1" : "0";
    R[j] = rbit;
    const pos = WIDTH - 1 - j;
    steps.push({
      grid: grid(),
      rowLabels,
      colLabels,
      tones: { [k(0, j)]: "focus", [k(1, j)]: "focus", [k(2, j)]: "active" },
      note: `Bit ${pos}: ${ab} ${sym} ${bb} = ${rbit}.`,
      vars: [["bit", pos], ["a", a], ["b", b]],
    });
  }

  const result = op === "and" ? a & b : op === "or" ? a | b : a ^ b;
  steps.push({
    grid: grid(),
    rowLabels,
    colLabels,
    tones: Object.fromEntries(
      Array.from({ length: WIDTH }, (_, j) => [k(2, j), "good"]),
    ) as Record<string, Tone>,
    note: `${a} ${sym} ${b} = ${result}. ${PAYOFF[op]}`,
    vars: [["a", a], ["b", b], ["result", result]],
  });
  return steps;
}
