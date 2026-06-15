import { describe, expect, it } from "vitest";
import { parseReplOps, replicationSteps } from "../replication-algos";

describe("parseReplOps", () => {
  it("parses write / sync / read tokens", () => {
    const { ops } = parseReplOps("write sync1 read2");
    expect(ops).toEqual([
      { kind: "write" },
      { kind: "sync", follower: 1 },
      { kind: "read", follower: 2 },
    ]);
  });

  it("rejects junk, empty and overflow", () => {
    expect(parseReplOps("frobnicate").error).toMatch(/unknown/);
    expect(parseReplOps("   ").error).toMatch(/enter/);
    expect(parseReplOps(Array(20).fill("write").join(" ")).error).toMatch(/≤/);
  });
});

describe("replicationSteps", () => {
  it("reads stale before catch-up and fresh after", () => {
    const { ops } = parseReplOps("write write read1 sync1 read1 sync1 read1");
    const steps = replicationSteps(ops!);
    const reads = steps.filter((s) => s.phase.startsWith("read"));
    expect(reads[0].phase).toBe("read-stale"); // F1 at v0 while leader is v2
    expect(reads[reads.length - 1].phase).toBe("read-fresh"); // caught up to v2
  });

  it("never lets a follower's version exceed the leader's", () => {
    const { ops } = parseReplOps("write sync1 sync1 sync1 read1");
    const steps = replicationSteps(ops!);
    for (const s of steps) {
      const leader = s.nodes.find((n) => n.role === "leader")!.version;
      for (const n of s.nodes) expect(n.version).toBeLessThanOrEqual(leader);
    }
  });
});
