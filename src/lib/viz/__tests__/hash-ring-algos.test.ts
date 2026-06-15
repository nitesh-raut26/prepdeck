import { describe, expect, it } from "vitest";
import { hashAngle, hashRingSteps, parseRingKeys } from "../hash-ring-algos";

describe("parseRingKeys", () => {
  it("splits and validates", () => {
    expect(parseRingKeys("a b").keys).toEqual(["a", "b"]);
    expect(parseRingKeys("").keys).toBeNull();
    expect(parseRingKeys(Array(20).fill("k").join(" ")).keys).toBeNull();
  });
});

describe("hashAngle", () => {
  it("is deterministic and within [0, 360)", () => {
    expect(hashAngle("x")).toBe(hashAngle("x"));
    expect(hashAngle("anything")).toBeGreaterThanOrEqual(0);
    expect(hashAngle("anything")).toBeLessThan(360);
  });
});

describe("hashRingSteps", () => {
  it("grows from 3 to 4 nodes and reassigns only a subset of keys", () => {
    const keys = ["user1", "cart9", "ord42", "img7", "sess3", "u88"];
    const steps = hashRingSteps(keys);

    expect(steps[0].nodes.length).toBe(3);

    const last = steps[steps.length - 1];
    expect(last.nodes.length).toBe(4);

    // every key resolves to one of the 4 nodes
    const nodeIds = new Set(last.nodes.map((n) => n.id));
    expect(last.keys.every((k) => nodeIds.has(k.owner))).toBe(true);

    // consistent hashing's whole point: adding a node moves a subset, not all
    const moved = last.keys.filter((k) => k.tone === "accent").length;
    expect(moved).toBeLessThan(keys.length);
  });
});
