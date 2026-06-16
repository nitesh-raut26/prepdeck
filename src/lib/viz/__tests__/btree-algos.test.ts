import { describe, expect, it } from "vitest";
import { btreeSteps, parseBTreeQuery } from "../btree-algos";

describe("parseBTreeQuery", () => {
  it("parses an equality key and a range", () => {
    expect(parseBTreeQuery("70").query).toEqual({ kind: "eq", key: 70 });
    expect(parseBTreeQuery("30-70").query).toEqual({
      kind: "range",
      lo: 30,
      hi: 70,
    });
  });

  it("rejects junk and inverted ranges", () => {
    expect(parseBTreeQuery("abc").error).toMatch(/key/);
    expect(parseBTreeQuery("70-30").error).toMatch(/low-high/);
  });
});

describe("btreeSteps — equality", () => {
  it("descends root→internal→leaf in 3 hops and finds an existing key", () => {
    const last = btreeSteps({ kind: "eq", key: 70 }).at(-1)!;
    expect(last.comparisons).toBe(3);
    expect(last.matched).toEqual([70]);
    expect(last.totalKeys).toBe(8);
  });

  it("reports a missing key as absent, still in 3 hops", () => {
    const last = btreeSteps({ kind: "eq", key: 55 }).at(-1)!;
    expect(last.matched).toEqual([]);
    expect(last.comparisons).toBe(3);
  });
});

describe("btreeSteps — range scan", () => {
  it("collects in-range keys across linked leaves and stops past the high bound", () => {
    const last = btreeSteps({ kind: "range", lo: 30, hi: 70 }).at(-1)!;
    expect(last.matched).toEqual([30, 40, 60, 70]);
  });
});
