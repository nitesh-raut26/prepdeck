import { describe, expect, it } from "vitest";
import { lruSteps, parseLruOps, type LruOp } from "../lru-algos";

const keys = (step: { order: { key: number }[] }) => step.order.map((e) => e.key);
const last = <T,>(a: T[]) => a[a.length - 1];

describe("parseLruOps", () => {
  it("parses a mixed op string", () => {
    expect(parseLruOps("put(1, 10), get(1), put(2,20)").ops).toEqual([
      { type: "put", key: 1, val: 10 },
      { type: "get", key: 1 },
      { type: "put", key: 2, val: 20 },
    ]);
  });

  it("rejects nonsense and a put missing its value", () => {
    expect(parseLruOps("nonsense").ops).toBeNull();
    expect(parseLruOps("put(1)").ops).toBeNull();
  });

  it("caps the number of ops", () => {
    const many = Array.from({ length: 20 }, (_, i) => `get(${i})`).join(", ");
    expect(parseLruOps(many).ops).toBeNull();
  });
});

describe("lruSteps", () => {
  it("evicts the least-recently-used key, not the oldest inserted", () => {
    // put 1, put 2, get 1 (promotes 1), put 3 → 2 is now LRU and must go.
    const ops: LruOp[] = [
      { type: "put", key: 1, val: 10 },
      { type: "put", key: 2, val: 20 },
      { type: "get", key: 1 },
      { type: "put", key: 3, val: 30 },
    ];
    const end = last(lruSteps(2, ops));
    expect(keys(end)).toEqual([3, 1]); // MRU → LRU
    expect(end.mapKeys).toEqual([1, 3]);
  });

  it("returns a miss for an absent key", () => {
    const end = last(lruSteps(2, [{ type: "get", key: 9 }]));
    expect(end.result).toBe("miss → -1");
    expect(end.vars).toContainEqual(["result", -1]);
  });

  it("updates an existing key in place and promotes it without growing", () => {
    const ops: LruOp[] = [
      { type: "put", key: 1, val: 10 },
      { type: "put", key: 2, val: 20 },
      { type: "put", key: 1, val: 99 },
    ];
    const end = last(lruSteps(2, ops));
    expect(keys(end)).toEqual([1, 2]); // 1 promoted to front
    expect(end.order.find((e) => e.key === 1)?.val).toBe(99);
    expect(end.mapKeys).toEqual([1, 2]);
  });

  it("never lets the cache exceed its capacity", () => {
    const ops: LruOp[] = [1, 2, 3, 4, 5].map((k) => ({
      type: "put",
      key: k,
      val: k * 10,
    }));
    for (const step of lruSteps(3, ops)) {
      expect(step.order.length).toBeLessThanOrEqual(3);
    }
  });

  it("clamps capacity into [1, 5]", () => {
    expect(lruSteps(99, [{ type: "get", key: 1 }])[0].capacity).toBe(5);
    expect(lruSteps(0, [{ type: "get", key: 1 }])[0].capacity).toBe(1);
  });
});
