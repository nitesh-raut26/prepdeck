import { describe, expect, it } from "vitest";
import {
  coinChangeSteps,
  fenwickSteps,
  fibSteps,
  gridPathsSteps,
  lcsSteps,
  prefixSumSteps,
} from "../dp-algos";
import { nQueensSteps, subsetsSteps } from "../backtracking-algos";
import { hashTableSteps } from "../hash-algos";
import { trieSteps } from "../trie-algos";
import { parseUfOps, unionFindSteps } from "../uf-algos";
import {
  activitySelectionSteps,
  mergeIntervalsSteps,
  parseIntervals,
} from "../interval-algos";
import { kmpSteps, naiveSearchSteps } from "../match-algos";
import { traversalSteps } from "../structure-algos";

function lastVar(
  steps: { vars?: [string, string | number][] }[],
  name: string,
): string | number | undefined {
  for (let i = steps.length - 1; i >= 0; i--) {
    const hit = steps[i].vars?.find(([k]) => k === name);
    if (hit) return hit[1];
  }
  return undefined;
}

describe("dynamic programming", () => {
  it("fib fills the table to the right answer", () => {
    expect(lastVar(fibSteps(9), "answer")).toBe(34);
  });

  it("coin change beats greedy on the classic counterexample", () => {
    // greedy (4+1+1) would say 3; the table knows 3+3 = 2 coins
    expect(lastVar(coinChangeSteps([1, 3, 4], 6), "answer")).toBe(2);
  });

  it("coin change reports impossible amounts as -1", () => {
    expect(lastVar(coinChangeSteps([2], 3), "answer")).toBe(-1);
  });

  it("grid paths computes C(r+c-2, r-1)", () => {
    expect(lastVar(gridPathsSteps(4, 5), "answer")).toBe(35);
  });

  it("LCS of the CLRS classic is 4", () => {
    expect(lastVar(lcsSteps("ABCBDAB", "BDCAB"), "answer")).toBe(4);
  });

  it("prefix sums answer a range query by subtraction", () => {
    // a[2..5] of [3,8,2,5,7,4,1,6] = 2+5+7+4
    expect(lastVar(prefixSumSteps([3, 8, 2, 5, 7, 4, 1, 6], 2, 5), "answer")).toBe(18);
  });

  it("fenwick query matches brute force", () => {
    const steps = fenwickSteps([3, 8, 2, 5, 7, 4, 1, 6], 6);
    expect(lastVar(steps, "answer")).toBe(29);
    expect(lastVar(steps, "brute force")).toBe(29);
  });
});

describe("backtracking", () => {
  it("n-queens finds a valid full placement", () => {
    const steps = nQueensSteps(4);
    const last = [...steps].reverse().find((s) => s.queens.length === 4)!;
    expect(last).toBeDefined();
    // no two queens share a column or diagonal
    const qs = last.queens;
    for (let i = 0; i < qs.length; i++) {
      for (let j = i + 1; j < qs.length; j++) {
        expect(qs[i].c).not.toBe(qs[j].c);
        expect(Math.abs(qs[i].r - qs[j].r)).not.toBe(Math.abs(qs[i].c - qs[j].c));
      }
    }
  });

  it("subsets enumerates all 2^n of them", () => {
    const steps = subsetsSteps([1, 2, 3]);
    expect(steps[steps.length - 1].results).toHaveLength(8);
    expect(new Set(steps[steps.length - 1].results).size).toBe(8);
  });
});

describe("hash table", () => {
  it("places every key in drawer key % m and finds a stored key", () => {
    const steps = hashTableSteps([12, 25, 35, 26], 7, 26);
    const final = steps[steps.length - 1];
    final.buckets.forEach((chain, b) => {
      for (const k of chain) expect(k % 7).toBe(b);
    });
    expect(final.note).toContain("found");
  });

  it("reports a missing key without searching other drawers", () => {
    const steps = hashTableSteps([12, 25], 7, 99);
    expect(steps[steps.length - 1].note).toContain("not stored");
  });
});

describe("trie", () => {
  it("shares prefixes and distinguishes word vs prefix", () => {
    const word = trieSteps(["car", "cat", "card"], "cat");
    expect(word[word.length - 1].note).toContain("stored");
    const prefix = trieSteps(["car", "cat", "card"], "ca");
    expect(prefix[prefix.length - 1].note).toContain("prefix");
    // c, a shared once: nodes = root + c,a + r,t + d = 6
    expect(word[word.length - 1].nodes).toHaveLength(6);
  });
});

describe("union-find", () => {
  it("merges groups and counts the remainder", () => {
    const ops = parseUfOps("union 0 1, union 2 3, union 1 3, find 0", 8);
    const steps = unionFindSteps(8, ops);
    const parent = steps[steps.length - 1].parent;
    const root = (x: number) => {
      while (parent[x] !== x) x = parent[x];
      return x;
    };
    expect(root(0)).toBe(root(3));
    expect(root(0)).toBe(root(2));
    expect(parent.filter((p, i) => p === i)).toHaveLength(5); // 8 - 3 merges
  });
});

describe("intervals", () => {
  it("activity selection picks the end-earliest set", () => {
    const ivs = parseIntervals("1-4, 3-5, 0-6, 5-7, 3-9, 5-9, 6-10, 8-11");
    expect(lastVar(activitySelectionSteps(ivs), "answer")).toBe(3); // 1–4, 5–7, 8–11
  });

  it("merge intervals collapses overlaps", () => {
    const ivs = parseIntervals("1-3, 2-6, 8-10, 15-18");
    expect(lastVar(mergeIntervalsSteps(ivs), "blocks")).toBe(3);
  });
});

describe("string matching", () => {
  const text = "ABABABCABABABD";
  const pat = "ABABD";

  it("naive finds the match position", () => {
    expect(lastVar(naiveSearchSteps(text, pat), "found at")).toBe(9);
  });

  it("KMP finds the same match without rewinding", () => {
    expect(lastVar(kmpSteps(text, pat), "found at")).toBe(9);
  });

  it("KMP's failure table for ABABD is 0,0,1,2,0", () => {
    const steps = kmpSteps(text, pat);
    const withLps = steps.filter((s) => s.lps && s.lps.every((v) => v !== null));
    expect(withLps[0].lps).toEqual([0, 0, 1, 2, 0]);
  });
});

describe("tree traversals", () => {
  const vals = [50, 30, 70, 20, 40, 60, 80];

  it("in-order reads a BST sorted", () => {
    const steps = traversalSteps(vals, "inorder");
    expect(lastVar(steps, "output")).toBe("20 30 40 50 60 70 80");
  });

  it("pre-order starts at the root", () => {
    expect(lastVar(traversalSteps(vals, "preorder"), "output")).toBe("50 30 20 40 70 60 80");
  });

  it("post-order ends at the root", () => {
    expect(lastVar(traversalSteps(vals, "postorder"), "output")).toBe("20 40 30 60 80 70 50");
  });

  it("level-order goes floor by floor", () => {
    expect(lastVar(traversalSteps(vals, "level"), "output")).toBe("50 30 70 20 40 60 80");
  });
});
