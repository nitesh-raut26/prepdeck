import { describe, expect, it } from "vitest";
import { cacheSteps, parseCacheKeys } from "../cache-algos";

describe("parseCacheKeys", () => {
  it("splits on whitespace/commas and validates", () => {
    expect(parseCacheKeys("A B  A").keys).toEqual(["A", "B", "A"]);
    expect(parseCacheKeys("   ").keys).toBeNull();
    expect(parseCacheKeys(Array(20).fill("A").join(" ")).keys).toBeNull();
  });
});

describe("cacheSteps", () => {
  it("counts hits/misses and evicts the LRU victim", () => {
    const steps = cacheSteps(["A", "B", "C", "B", "A", "D", "A"], 3);
    const last = steps[steps.length - 1];
    // A m, B m, C m, B hit, A hit, D miss→evict C, A hit
    expect(last.hits).toBe(3);
    expect(last.misses).toBe(4);

    const evictStep = steps.find((s) => s.phase === "evict");
    expect(evictStep?.evicted).toBe("C");

    // never exceeds capacity
    expect(Math.max(...steps.map((s) => s.cache.length))).toBe(3);
  });

  it("serves repeats from cache without touching the store", () => {
    const steps = cacheSteps(["X", "X", "X"], 2);
    expect(steps.filter((s) => s.phase === "hit").length).toBe(2);
    expect(steps.filter((s) => s.phase === "miss").length).toBe(1);
  });
});
