import type { DriftStep } from "./types";

/** Monitored feature bucketed into 6 bins (e.g. a standardized score). */
const BINS = ["<0", "0–1", "1–2", "2–3", "3–4", ">4"];
/** Reference = the distribution the model was trained on (proportions). */
const REFERENCE = [0.05, 0.2, 0.35, 0.25, 0.1, 0.05];

const THRESHOLD = 0.25; // PSI ≥ 0.25 = significant drift (industry rule of thumb)
const WINDOWS = 6;
const SHIFT = 0.18; // fraction of mass that drifts one bin right each window

/** Population Stability Index: Σ (cur − ref) · ln(cur / ref). */
export function psi(ref: number[], cur: number[]): number {
  const eps = 1e-4;
  return ref.reduce((s, r, i) => {
    const a = Math.max(cur[i], eps);
    const b = Math.max(r, eps);
    return s + (a - b) * Math.log(a / b);
  }, 0);
}

/** Move `frac` of every bin's mass one bin to the right, then renormalize. */
function shiftRight(dist: number[], frac: number): number[] {
  const out = dist.map((x) => x * (1 - frac));
  for (let i = 0; i < dist.length - 1; i++) out[i + 1] += dist[i] * frac;
  out[dist.length - 1] += dist[dist.length - 1] * frac; // last bin retains its shift
  const sum = out.reduce((a, b) => a + b, 0);
  return out.map((x) => x / sum);
}

const statusOf = (score: number): DriftStep["status"] =>
  score < 0.1 ? "healthy" : score < THRESHOLD ? "warning" : "alert";

/**
 * Walks a deployed model through successive monitoring windows as its input
 * feature quietly drifts right, recomputing PSI each window until it crosses
 * the retrain threshold. Pure: () => DriftStep[].
 */
export function driftSteps(): DriftStep[] {
  const steps: DriftStep[] = [];
  let cur = [...REFERENCE];

  for (let w = 0; w <= WINDOWS; w++) {
    const score = psi(REFERENCE, cur);
    const status = statusOf(score);
    const note =
      status === "healthy"
        ? `Window t+${w}: the live distribution still matches training. PSI = ${score.toFixed(3)} < 0.1 — model is healthy, no action.`
        : status === "warning"
          ? `Window t+${w}: the feature is drifting right. PSI = ${score.toFixed(3)} (0.1–0.25) — investigate; the model's assumptions are slipping.`
          : `Window t+${w}: significant drift. PSI = ${score.toFixed(3)} ≥ ${THRESHOLD} — live data no longer looks like training data. Trigger an alert and retrain.`;

    steps.push({
      bins: BINS,
      reference: REFERENCE,
      current: [...cur],
      window: w,
      score,
      threshold: THRESHOLD,
      status,
      note,
      vars: [
        ["window", `t+${w}`],
        ["PSI", score.toFixed(3)],
        ["status", status],
      ],
    });

    cur = shiftRight(cur, SHIFT);
  }
  return steps;
}
