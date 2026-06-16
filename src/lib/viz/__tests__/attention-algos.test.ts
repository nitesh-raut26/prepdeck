import { describe, expect, it } from "vitest";
import { ATTN_TOKENS, attentionSteps } from "../attention-algos";

const last = <T,>(a: T[]) => a[a.length - 1];

describe("attentionSteps", () => {
  it("'it' attends most to 'animal' (the coreference the example is tuned for)", () => {
    const steps = attentionSteps(ATTN_TOKENS.indexOf("it"));
    expect(last(steps).dominant).toBe(ATTN_TOKENS.indexOf("animal"));
  });

  it("'crossed' attends most to its subject 'animal'", () => {
    const steps = attentionSteps(ATTN_TOKENS.indexOf("crossed"));
    expect(last(steps).dominant).toBe(ATTN_TOKENS.indexOf("animal"));
  });

  it("softmax attention weights sum to 1", () => {
    const soft = attentionSteps(0).find((s) => s.weights);
    const sum = soft!.weights!.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1, 5);
  });

  it("walks start → scores → softmax → output", () => {
    expect(attentionSteps(3).map((s) => s.phase)).toEqual([
      "start",
      "scores",
      "softmax",
      "output",
    ]);
  });
});
