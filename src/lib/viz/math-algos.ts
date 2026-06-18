import type { DpStep } from "./types";

/**
 * Number-theory visualizers (Euclid's GCD and fast exponentiation), rendered
 * on the DP table canvas as a descent / step table that grows one row per
 * iteration. Both show *why* the work is O(log n).
 */

const k = (r: number, c: number) => `${r},${c}`;

/* ── Euclid's algorithm: gcd(a, b) = gcd(b, a mod b) ──────────────────── */

export function gcdSteps(a: number, b: number): DpStep[] {
  a = Math.max(1, Math.min(Math.trunc(Math.abs(a)) || 1, 9999));
  b = Math.max(1, Math.min(Math.trunc(Math.abs(b)) || 1, 9999));
  const colLabels = ["a", "b", "a mod b"];
  const rows: (string | null)[][] = [];
  const steps: DpStep[] = [];

  steps.push({
    grid: [[null, null, null]],
    colLabels,
    note: `Euclid's algorithm: gcd(a, b) = gcd(b, a mod b). Keep replacing (a, b) with (b, a mod b) until b hits 0 — the last nonzero value is the gcd. Start: a = ${a}, b = ${b}.`,
    vars: [["a", a], ["b", b]],
  });

  let x = a;
  let y = b;
  while (y !== 0) {
    const r = x % y;
    rows.push([String(x), String(y), String(r)]);
    const last = rows.length - 1;
    steps.push({
      grid: rows.map((row) => [...row]),
      colLabels,
      tones: { [k(last, 0)]: "active", [k(last, 1)]: "active", [k(last, 2)]: "focus" },
      note:
        r === 0
          ? `${x} mod ${y} = 0 — divisible. The next b is 0, so the gcd is ${y}.`
          : `${x} mod ${y} = ${r}. Replace (a, b) with (${y}, ${r}) and repeat.`,
      vars: [["a", x], ["b", y], ["a mod b", r]],
    });
    x = y;
    y = r;
  }

  steps.push({
    grid: [...rows.map((row) => [...row]), [String(x), "0", "—"]],
    colLabels,
    tones: { [k(rows.length, 0)]: "good" },
    note: `b is 0, so we stop: gcd(${a}, ${b}) = ${x}. The remainder shrinks fast, so this takes O(log min(a, b)) steps — the reason fractions reduce and the modular inverse compute instantly.`,
    vars: [["gcd", x]],
  });
  return steps;
}

/* ── Fast exponentiation: aⁿ by repeated squaring ─────────────────────── */

export function fastPowSteps(base: number, exp: number): DpStep[] {
  base = Math.max(2, Math.min(Math.trunc(base) || 2, 9));
  exp = Math.max(1, Math.min(Math.trunc(exp) || 1, 16));
  const colLabels = ["k", "bit", "base", "result"];
  const bin = exp.toString(2);
  const rows: (string | null)[][] = [];
  const steps: DpStep[] = [];

  steps.push({
    grid: [[null, null, null, null]],
    colLabels,
    note: `Compute ${base}^${exp} by squaring. Write the exponent in binary: ${exp} = ${bin}₂. Walk its bits from least significant — square the base every step, and fold it into the result only where the bit is 1. "base" is a raised to 2^k.`,
    vars: [["a", base], ["n", exp], ["n in binary", bin]],
  });

  let result = 1;
  let b = base;
  let e = exp;
  let kk = 0;
  while (e > 0) {
    const bit = e & 1;
    const before = result;
    if (bit) result *= b;
    rows.push([String(kk), String(bit), String(b), String(result)]);
    const last = rows.length - 1;
    steps.push({
      grid: rows.map((r) => [...r]),
      colLabels,
      tones: bit
        ? { [k(last, 1)]: "good", [k(last, 2)]: "focus", [k(last, 3)]: "active" }
        : { [k(last, 1)]: "muted", [k(last, 2)]: "muted" },
      note: bit
        ? `Bit ${kk} is 1: fold the current base (a^${2 ** kk} = ${b}) into the result → ${before} × ${b} = ${result}.`
        : `Bit ${kk} is 0: skip the multiply — but still square the base for the next bit.`,
      vars: [["k", kk], ["bit", bit], ["base", b], ["result", result]],
    });
    b = b * b;
    e >>= 1;
    kk++;
  }

  steps.push({
    grid: rows.map((r) => [...r]),
    colLabels,
    tones: { [k(rows.length - 1, 3)]: "good" },
    note: `${base}^${exp} = ${result}. Only ${kk} multiplications (one per bit of ${exp}) instead of ${exp} — that's O(log n). Take every product mod m and this same square-and-multiply becomes modular exponentiation, the workhorse of cryptography.`,
    vars: [["answer", result]],
  });
  return steps;
}
