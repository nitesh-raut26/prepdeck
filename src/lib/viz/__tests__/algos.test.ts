import { describe, expect, it } from "vitest";
import {
  binarySearchSteps,
  slidingWindowSteps,
  sortSteps,
  twoPointersSteps,
  type SortKind,
} from "../array-algos";
import {
  bstSteps,
  heapSteps,
  parseOps,
  queueSteps,
  reverseListSteps,
  stackSteps,
} from "../structure-algos";
import {
  bfsSteps,
  DEMO_GRAPH,
  dfsSteps,
  dijkstraDistances,
  dijkstraSteps,
  WEIGHTED_GRAPH,
} from "../graph-algos";

describe("binarySearchSteps", () => {
  const arr = [3, 9, 14, 21, 27, 38, 51, 66, 70, 82];

  it("finds a present target and reports its index", () => {
    const steps = binarySearchSteps(arr, 38);
    const last = steps[steps.length - 1];
    expect(last.vars).toContainEqual(["answer", arr.indexOf(38)]);
  });

  it("reports -1 for a missing target", () => {
    const steps = binarySearchSteps(arr, 40);
    const last = steps[steps.length - 1];
    expect(last.vars).toContainEqual(["answer", -1]);
  });

  it("uses at most ~log2(n) comparison rounds", () => {
    // Each loop iteration produces ≤ 2 steps plus 2 boundary steps.
    const steps = binarySearchSteps(arr, 82);
    expect(steps.length).toBeLessThanOrEqual(2 + 2 * (Math.ceil(Math.log2(arr.length)) + 1));
  });

  it("sorts unsorted input before searching", () => {
    const steps = binarySearchSteps([5, 1, 4], 4);
    expect(steps[0].values).toEqual([1, 4, 5]);
  });
});

describe("sortSteps", () => {
  const kinds: SortKind[] = ["bubble", "selection", "insertion", "quick", "merge"];
  const input = [38, 12, 71, 5, 56, 24, 90, 17, 12];
  const expected = [...input].sort((a, b) => a - b);

  for (const kind of kinds) {
    it(`${kind} sort ends sorted and never mutates its input`, () => {
      const copy = [...input];
      const steps = sortSteps(copy, kind);
      expect(steps[steps.length - 1].values).toEqual(expected);
      expect(copy).toEqual(input);
    });
  }

  it("bubble sort exits early on sorted input", () => {
    const steps = sortSteps([1, 2, 3, 4, 5, 6], "bubble");
    // one initial + 5 compares + pass-done + early-exit ≈ far fewer than a full O(n²) run
    expect(steps.length).toBeLessThan(12);
  });
});

describe("twoPointersSteps", () => {
  it("finds a valid pair", () => {
    const steps = twoPointersSteps([2, 7, 11, 15, 19, 23, 30, 41], 34);
    expect(steps[steps.length - 1].note).toContain("= 34");
  });

  it("exhausts without a pair", () => {
    const steps = twoPointersSteps([1, 2, 3], 100);
    expect(steps[steps.length - 1].note).toContain("no pair");
  });
});

describe("slidingWindowSteps", () => {
  it("finds the max-sum window", () => {
    const steps = slidingWindowSteps([4, 2, 9, 7, 5, 1, 8, 6, 3], 3);
    // best window is [9,7,5] = 21
    expect(steps[steps.length - 1].vars).toContainEqual(["best", 21]);
  });

  it("rejects invalid k", () => {
    expect(slidingWindowSteps([1, 2], 5)).toHaveLength(1);
  });
});

describe("stack / queue", () => {
  it("parses ops text", () => {
    expect(parseOps("push 4, pop, enqueue 7")).toEqual([
      { kind: "push", value: 4 },
      { kind: "pop" },
      { kind: "push", value: 7 },
    ]);
  });

  it("stack pops LIFO", () => {
    const steps = stackSteps(parseOps("push 1, push 2, pop"));
    expect(steps[steps.length - 1].items).toEqual([1]);
  });

  it("queue pops FIFO", () => {
    const steps = queueSteps(parseOps("push 1, push 2, pop"));
    expect(steps[steps.length - 1].items).toEqual([2]);
  });

  it("handles underflow without throwing", () => {
    expect(() => stackSteps(parseOps("pop"))).not.toThrow();
  });
});

describe("reverseListSteps", () => {
  it("fully reverses the next pointers", () => {
    const steps = reverseListSteps([1, 2, 3, 4]);
    const last = steps[steps.length - 1];
    expect(last.head).toBe(3); // node id 3 holds value 4
    // walk the reversed list by ids
    const order: number[] = [];
    let at: number | null = last.head;
    while (at !== null) {
      order.push(last.nodes[at].value);
      at = last.next[at];
    }
    expect(order).toEqual([4, 3, 2, 1]);
  });
});

describe("bstSteps", () => {
  it("finds an inserted value", () => {
    const steps = bstSteps([50, 30, 70, 20, 40], 40);
    expect(steps[steps.length - 1].note).toContain("Found 40");
  });

  it("reports a missing value", () => {
    const steps = bstSteps([50, 30, 70], 99);
    expect(steps[steps.length - 1].note).toContain("not in the tree");
  });

  it("preserves the BST invariant in the final tree", () => {
    const steps = bstSteps([50, 30, 70, 20, 40, 60, 80], 50);
    const root = steps[steps.length - 1].root!;
    const inorder: number[] = [];
    (function walk(t: typeof root | null | undefined) {
      if (!t) return;
      walk(t.l);
      inorder.push(t.v);
      walk(t.r);
    })(root);
    expect(inorder).toEqual([20, 30, 40, 50, 60, 70, 80]);
  });
});

describe("heapSteps", () => {
  it("maintains the min-heap property at the end", () => {
    const steps = heapSteps([42, 17, 33, 8, 25, 4, 51]);
    const heap = steps[steps.length - 1].values;
    for (let i = 1; i < heap.length; i++) {
      expect(heap[(i - 1) >> 1]).toBeLessThanOrEqual(heap[i]);
    }
    // 4 was the min and was extracted; 8 is the new root
    expect(heap[0]).toBe(8);
  });
});

describe("graph traversals", () => {
  it("BFS visits every node exactly once", () => {
    const steps = bfsSteps(DEMO_GRAPH, "A");
    const last = steps[steps.length - 1];
    const visited = Object.entries(last.nodeTones).filter(([, t]) => t === "good");
    expect(visited).toHaveLength(DEMO_GRAPH.nodes.length);
  });

  it("DFS visits every node exactly once", () => {
    const steps = dfsSteps(DEMO_GRAPH, "C");
    const last = steps[steps.length - 1];
    const visited = Object.entries(last.nodeTones).filter(([, t]) => t === "good");
    expect(visited).toHaveLength(DEMO_GRAPH.nodes.length);
  });

  it("Dijkstra computes known shortest distances from A", () => {
    // Hand-checked on WEIGHTED_GRAPH.
    expect(dijkstraDistances(WEIGHTED_GRAPH, "A")).toEqual({
      A: 0, B: 4, C: 2, D: 9, E: 10, F: 15, G: 13, H: 17,
    });
  });

  it("Dijkstra's final table matches dijkstraDistances", () => {
    const steps = dijkstraSteps(WEIGHTED_GRAPH, "A");
    const table = steps[steps.length - 1].table!;
    const dist = dijkstraDistances(WEIGHTED_GRAPH, "A");
    const ids = table.head.slice(1);
    const row = table.rows[0].slice(1);
    ids.forEach((id, i) => expect(row[i]).toBe(dist[id]));
  });
});
