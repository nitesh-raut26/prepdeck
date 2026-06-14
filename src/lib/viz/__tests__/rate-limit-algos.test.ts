import { describe, expect, it } from "vitest";
import { parseTokenBucket, tokenBucketSteps } from "../rate-limit-algos";

describe("parseTokenBucket", () => {
  it("accepts valid R, B and request times, sorting the times", () => {
    const { input, error } = parseTokenBucket("2", "5", "2 0 0");
    expect(error).toBeNull();
    expect(input).toEqual({ rate: 2, capacity: 5, requests: [0, 0, 2] });
  });

  it("rejects bad rate, capacity and request inputs", () => {
    expect(parseTokenBucket("0", "5", "0").error).toMatch(/rate/);
    expect(parseTokenBucket("2", "0", "0").error).toMatch(/capacity/);
    expect(parseTokenBucket("2", "5", "  ").error).toMatch(/enter/);
    expect(parseTokenBucket("2", "5", "-1").error).toMatch(/request times/);
    expect(
      parseTokenBucket("2", "5", Array(20).fill("0").join(" ")).error,
    ).toMatch(/≤/);
  });
});

describe("tokenBucketSteps", () => {
  it("allows a burst up to capacity, 429s the overflow, then recovers on refill", () => {
    const { input } = parseTokenBucket("2", "5", "0 0 0 0 0 0 2 2");
    const steps = tokenBucketSteps(input!);

    // Starts full.
    expect(steps[0].phase).toBe("start");
    expect(steps[0].tokens).toBe(5);

    const allows = steps.filter((s) => s.phase === "allow");
    const rejects = steps.filter((s) => s.phase === "reject");
    expect(allows.length).toBe(7); // 5 in the opening burst + 2 after the drip
    expect(rejects.length).toBe(1); // the 6th request in the burst
    expect(rejects[0].tokens).toBe(0); // refused while empty

    // The cap is never exceeded even though refills keep dripping.
    expect(Math.max(...steps.map((s) => s.tokens))).toBe(5);
  });

  it("caps refills at capacity", () => {
    const { input } = parseTokenBucket("10", "3", "0 5");
    const steps = tokenBucketSteps(input!);
    expect(steps.every((s) => s.tokens <= 3)).toBe(true);
  });
});
