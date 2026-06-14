import type { TokenBucketStep } from "./types";

export type TokenBucketInput = {
  rate: number;
  capacity: number;
  /** Request arrival times in seconds (sorted ascending). */
  requests: number[];
};

const MAX_REQUESTS = 14;
const MAX_TIME = 20;

/**
 * Parse the three editable fields into a validated input, or an error string.
 * Kept pure + separate so the visualizer can show inline validation.
 */
export function parseTokenBucket(
  rateStr: string,
  capStr: string,
  reqStr: string,
): { input: TokenBucketInput | null; error: string | null } {
  const rate = Number(rateStr);
  const capacity = Number(capStr);
  if (!Number.isInteger(rate) || rate < 1 || rate > 10)
    return { input: null, error: "rate R: an integer 1–10" };
  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 12)
    return { input: null, error: "capacity B: an integer 1–12" };
  const requests = reqStr
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(Number);
  if (requests.length === 0)
    return { input: null, error: "enter request times, e.g. 0 0 0 0 0 0 2 2" };
  if (requests.some((t) => !Number.isInteger(t) || t < 0 || t > MAX_TIME))
    return { input: null, error: `request times: integers 0–${MAX_TIME}` };
  if (requests.length > MAX_REQUESTS)
    return { input: null, error: `keep it to ≤ ${MAX_REQUESTS} requests` };
  requests.sort((a, b) => a - b);
  return { input: { rate, capacity, requests }, error: null };
}

/**
 * Token-bucket rate limiter, stepped for the visualizer. The bucket starts
 * full (capacity = burst allowance). Each second R tokens drip in (capped at
 * capacity); each request takes one token if available (✓ forwarded) or is
 * refused (✗ 429). Pure: (input) => TokenBucketStep[], so it is unit-testable
 * and free of React.
 */
export function tokenBucketSteps(input: TokenBucketInput): TokenBucketStep[] {
  const { rate, capacity, requests } = input;
  const steps: TokenBucketStep[] = [];
  let tokens = capacity;
  const log: { label: string; ok: boolean }[] = [];
  const lastTime = requests[requests.length - 1] ?? 0;

  // Index requests by arrival second, preserving order → r1, r2, …
  const byTime = new Map<number, string[]>();
  requests.forEach((t, i) => {
    const list = byTime.get(t) ?? [];
    list.push(`r${i + 1}`);
    byTime.set(t, list);
  });

  steps.push({
    capacity,
    rate,
    tokens,
    time: 0,
    phase: "start",
    request: null,
    log: [],
    note: `Bucket starts full: ${capacity} tokens. R = ${rate}/s bounds the long-run rate; B = ${capacity} is the burst a quiet period earns you.`,
    vars: [
      ["tokens", `${tokens}/${capacity}`],
      ["R", `${rate}/s`],
    ],
  });

  for (let t = 0; t <= lastTime; t++) {
    if (t > 0) {
      const before = tokens;
      tokens = Math.min(capacity, tokens + rate);
      steps.push({
        capacity,
        rate,
        tokens,
        time: t,
        phase: "refill",
        request: null,
        log: [...log],
        note: `t = ${t}s: +${rate} tokens drip in${
          before === capacity
            ? " (already full — the surplus is lost, which is the cap's whole job)"
            : ""
        } → ${tokens}/${capacity}.`,
        vars: [
          ["tokens", `${tokens}/${capacity}`],
          ["t", `${t}s`],
        ],
      });
    }
    for (const label of byTime.get(t) ?? []) {
      if (tokens >= 1) {
        tokens -= 1;
        log.push({ label, ok: true });
        steps.push({
          capacity,
          rate,
          tokens,
          time: t,
          phase: "allow",
          request: label,
          log: [...log],
          note: `${label} at t = ${t}s: a token is available → take one (${tokens} left). ✓ forwarded.`,
          vars: [
            ["tokens", `${tokens}/${capacity}`],
            ["last", `${label} ✓`],
          ],
        });
      } else {
        log.push({ label, ok: false });
        steps.push({
          capacity,
          rate,
          tokens,
          time: t,
          phase: "reject",
          request: label,
          log: [...log],
          note: `${label} at t = ${t}s: bucket empty → ✗ 429 Too Many Requests + Retry-After. The burst is spent; only the drip lets more through.`,
          vars: [
            ["tokens", `0/${capacity}`],
            ["last", `${label} ✗`],
          ],
        });
      }
    }
  }
  return steps;
}
