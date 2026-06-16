import { describe, expect, it } from "vitest";
import { driftSteps, psi } from "../drift-algos";

const last = <T,>(a: T[]) => a[a.length - 1];

describe("psi", () => {
  it("is 0 for identical distributions", () => {
    const d = [0.2, 0.3, 0.5];
    expect(psi(d, d)).toBeCloseTo(0, 6);
  });

  it("grows as distributions diverge", () => {
    const ref = [0.5, 0.3, 0.2];
    expect(psi(ref, [0.1, 0.2, 0.7])).toBeGreaterThan(
      psi(ref, [0.45, 0.32, 0.23]),
    );
  });
});

describe("driftSteps", () => {
  it("starts healthy (PSI ≈ 0) and ends in an alert past the threshold", () => {
    const steps = driftSteps();
    expect(steps[0].status).toBe("healthy");
    expect(steps[0].score).toBeCloseTo(0, 4);
    expect(last(steps).status).toBe("alert");
    expect(last(steps).score).toBeGreaterThanOrEqual(0.25);
  });

  it("PSI increases monotonically as the feature drifts", () => {
    const scores = driftSteps().map((s) => s.score);
    for (let i = 1; i < scores.length; i++)
      expect(scores[i]).toBeGreaterThanOrEqual(scores[i - 1]);
  });

  it("every window's live distribution stays normalized", () => {
    for (const s of driftSteps())
      expect(s.current.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 5);
  });
});
