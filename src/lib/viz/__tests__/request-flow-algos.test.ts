import { describe, expect, it } from "vitest";
import { parseFlowRequests, requestFlowSteps } from "../request-flow-algos";

describe("parseFlowRequests", () => {
  it("splits on commas and newlines", () => {
    expect(parseFlowRequests("GET /a, GET /b").requests).toEqual([
      "GET /a",
      "GET /b",
    ]);
    expect(parseFlowRequests("").requests).toBeNull();
  });
});

describe("requestFlowSteps", () => {
  it("misses cold keys, hits a repeated key, and round-robins servers", () => {
    const steps = requestFlowSteps(["GET /u/7", "GET /u/9", "GET /u/7"], 3);

    // 3rd request repeats the 1st → cache hit; the cold ones miss.
    const outcomes = steps
      .filter((s) => s.stage === "cache")
      .map((s) => s.cacheOutcome);
    expect(outcomes).toEqual(["miss", "miss", "hit"]);

    // The DB is touched only on the two misses.
    expect(steps.filter((s) => s.stage === "db").length).toBe(2);

    // Round-robin across the 3 servers.
    const servers = steps
      .filter((s) => s.stage === "lb")
      .map((s) => s.activeServer);
    expect(servers).toEqual([0, 1, 2]);
  });
});
