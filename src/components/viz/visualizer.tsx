"use client";

import { useMemo, useState } from "react";
import { Shuffle } from "lucide-react";
import {
  binarySearchSteps,
  slidingWindowSteps,
  sortSteps,
  twoPointersSteps,
  type SortKind,
} from "@/lib/viz/array-algos";
import {
  bstSteps,
  heapSteps,
  parseOps,
  queueSteps,
  reverseListSteps,
  stackSteps,
  traversalSteps,
  type TraversalKind,
} from "@/lib/viz/structure-algos";
import {
  coinChangeSteps,
  fenwickSteps,
  fibSteps,
  gridPathsSteps,
  lcsSteps,
  prefixSumSteps,
} from "@/lib/viz/dp-algos";
import { nQueensSteps, subsetsSteps } from "@/lib/viz/backtracking-algos";
import { hashTableSteps } from "@/lib/viz/hash-algos";
import { trieSteps } from "@/lib/viz/trie-algos";
import { parseUfOps, unionFindSteps } from "@/lib/viz/uf-algos";
import {
  activitySelectionSteps,
  mergeIntervalsSteps,
  parseIntervals,
} from "@/lib/viz/interval-algos";
import { kmpSteps, naiveSearchSteps } from "@/lib/viz/match-algos";
import {
  bfsSteps,
  DEMO_GRAPH,
  dfsSteps,
  dijkstraSteps,
  WEIGHTED_GRAPH,
} from "@/lib/viz/graph-algos";
import type { Complexity } from "@/lib/viz/types";
import { cn } from "@/lib/cn";
import { useStepper } from "./stepper";
import { VizField, VizPlayer } from "./player";
import { ArrayCanvas } from "./array-canvas";
import { BoxesCanvas } from "./boxes-canvas";
import { ListCanvas } from "./list-canvas";
import { GraphCanvas } from "./graph-canvas";
import { HeapCanvas, TreeCanvas } from "./tree-canvas";
import { DpCanvas } from "./dp-canvas";
import { BoardCanvas, SubsetsCanvas } from "./backtracking-canvas";
import { HashCanvas } from "./hash-canvas";
import { TrieCanvas } from "./trie-canvas";
import { UfCanvas } from "./uf-canvas";
import { IntervalCanvas } from "./interval-canvas";
import { MatchCanvas } from "./match-canvas";

export type VisualizerAlgo =
  | "binary-search"
  | "sorting"
  | "two-pointers"
  | "sliding-window"
  | "stack"
  | "queue"
  | "linked-list-reverse"
  | "bst"
  | "heap"
  | "bfs"
  | "dfs"
  | "dijkstra"
  | "dp"
  | "n-queens"
  | "subsets"
  | "hash-table"
  | "trie"
  | "union-find"
  | "activity-selection"
  | "merge-intervals"
  | "string-match"
  | "tree-traversal"
  | "prefix-sum"
  | "fenwick";

/**
 * MDX entry point: <Visualizer algo="binary-search" />
 * Each algorithm family manages its own inputs; changing an input re-runs
 * the pure step generator and rewinds the player.
 * `problem` preselects a variant where a visualizer offers several
 * (dp: fib | coins | paths | lcs; string-match: naive | kmp;
 * tree-traversal: inorder | preorder | postorder | level).
 */
export function Visualizer({ algo, problem }: { algo: VisualizerAlgo; problem?: string }) {
  switch (algo) {
    case "binary-search":
      return <BinarySearchViz />;
    case "sorting":
      return <SortingViz />;
    case "two-pointers":
      return <TwoPointersViz />;
    case "sliding-window":
      return <SlidingWindowViz />;
    case "stack":
      return <BoxesViz mode="stack" />;
    case "queue":
      return <BoxesViz mode="queue" />;
    case "linked-list-reverse":
      return <ListViz />;
    case "bst":
      return <BstViz />;
    case "heap":
      return <HeapViz />;
    case "bfs":
    case "dfs":
    case "dijkstra":
      return <GraphViz kind={algo} />;
    case "dp":
      return <DpViz initial={problem} />;
    case "n-queens":
      return <NQueensViz />;
    case "subsets":
      return <SubsetsViz />;
    case "hash-table":
      return <HashViz />;
    case "trie":
      return <TrieViz />;
    case "union-find":
      return <UnionFindViz />;
    case "activity-selection":
      return <IntervalsViz kind="activity" />;
    case "merge-intervals":
      return <IntervalsViz kind="merge" />;
    case "string-match":
      return <MatchViz initial={problem} />;
    case "tree-traversal":
      return <TraversalViz initial={problem} />;
    case "prefix-sum":
      return <PrefixSumViz />;
    case "fenwick":
      return <FenwickViz />;
    default:
      return (
        <div className="not-prose my-6 rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
          Unknown visualizer: {String(algo)}
        </div>
      );
  }
}

/* Shared pill-selector used by multi-variant visualizers. */
function PillSelect<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-faint">
        {label}
      </span>
      <div className="flex flex-wrap gap-1 rounded-lg border border-line p-0.5">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={cn(
              "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
              value === o.id ? "bg-brand-600/30 text-brand-300" : "text-faint hover:text-subtle",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ── Input parsing ────────────────────────────────────────────────────── */

const MAX_ITEMS = 12;

function parseNums(text: string): { nums: number[] | null; error: string | null } {
  const nums = text
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(Number);
  if (nums.length === 0 || nums.some((n) => !Number.isFinite(n))) {
    return { nums: null, error: "Enter comma-separated numbers" };
  }
  if (nums.length > MAX_ITEMS) {
    return { nums: null, error: `Keep it to ≤ ${MAX_ITEMS} numbers so steps stay readable` };
  }
  return { nums: nums.map((n) => Math.trunc(n)), error: null };
}

/** Text field + committed-value pair: commit on Enter / blur. */
function useNumsInput(initial: number[]) {
  const [text, setText] = useState(initial.join(", "));
  const [nums, setNums] = useState<number[]>(initial);
  const [error, setError] = useState<string | null>(null);
  const commit = () => {
    const { nums: parsed, error: err } = parseNums(text);
    setError(err);
    if (parsed) setNums(parsed);
  };
  const set = (next: number[]) => {
    setNums(next);
    setText(next.join(", "));
    setError(null);
  };
  return { text, setText, nums, error, commit, set };
}

function useIntInput(initial: number) {
  const [text, setText] = useState(String(initial));
  const [value, setValue] = useState(initial);
  const commit = () => {
    const n = Number(text.trim());
    if (Number.isFinite(n)) setValue(Math.trunc(n));
  };
  return { text, setText, value, commit };
}

function shuffled(n: number): number[] {
  const a = Array.from({ length: n }, (_, i) => (i + 1) * 7 + Math.floor(Math.random() * 5));
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ── Array-family visualizers ─────────────────────────────────────────── */

function BinarySearchViz() {
  const arr = useNumsInput([3, 9, 14, 21, 27, 38, 51, 66, 70, 82]);
  const target = useIntInput(38);
  const steps = useMemo(
    () => binarySearchSteps(arr.nums, target.value),
    [arr.nums, target.value],
  );
  const stepper = useStepper(steps);
  return (
    <VizPlayer
      title="Binary search"
      complexity={{ time: "O(log n)", space: "O(1)" }}
      stepper={stepper}
      inputs={
        <>
          <VizField label="array (auto-sorted)" wide value={arr.text} onChange={arr.setText} onCommit={arr.commit} error={arr.error} />
          <VizField label="target" value={target.text} onChange={target.setText} onCommit={target.commit} />
        </>
      }
    >
      <ArrayCanvas step={stepper.step} />
    </VizPlayer>
  );
}

const SORT_KINDS: { id: SortKind; label: string; complexity: Complexity }[] = [
  { id: "bubble", label: "Bubble", complexity: { time: "O(n²)", space: "O(1)" } },
  { id: "selection", label: "Selection", complexity: { time: "O(n²)", space: "O(1)" } },
  { id: "insertion", label: "Insertion", complexity: { time: "O(n²)", space: "O(1)" } },
  { id: "merge", label: "Merge", complexity: { time: "O(n log n)", space: "O(n)" } },
  { id: "quick", label: "Quick", complexity: { time: "O(n log n) avg", space: "O(log n)" } },
];

function SortingViz() {
  const arr = useNumsInput([38, 12, 71, 5, 56, 24, 90, 17]);
  const [kind, setKind] = useState<SortKind>("bubble");
  const meta = SORT_KINDS.find((k) => k.id === kind)!;
  const steps = useMemo(() => sortSteps(arr.nums, kind), [arr.nums, kind]);
  const stepper = useStepper(steps);
  return (
    <VizPlayer
      title={`${meta.label} sort`}
      complexity={meta.complexity}
      stepper={stepper}
      inputs={
        <>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] font-medium uppercase tracking-wide text-faint">
              algorithm
            </span>
            <div className="flex flex-wrap gap-1 rounded-lg border border-line p-0.5">
              {SORT_KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKind(k.id)}
                  className={cn(
                    "rounded-md px-2 py-1 text-[11px] font-medium transition-colors",
                    kind === k.id ? "bg-brand-600/30 text-brand-300" : "text-faint hover:text-subtle",
                  )}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </div>
          <VizField label="array" wide value={arr.text} onChange={arr.setText} onCommit={arr.commit} error={arr.error} />
          <button
            type="button"
            onClick={() => arr.set(shuffled(8))}
            className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs text-subtle transition-colors hover:bg-surface-3 hover:text-ink"
          >
            <Shuffle className="size-3.5" /> Shuffle
          </button>
        </>
      }
    >
      <ArrayCanvas step={stepper.step} />
    </VizPlayer>
  );
}

function TwoPointersViz() {
  const arr = useNumsInput([2, 7, 11, 15, 19, 23, 30, 41]);
  const target = useIntInput(34);
  const steps = useMemo(
    () => twoPointersSteps(arr.nums, target.value),
    [arr.nums, target.value],
  );
  const stepper = useStepper(steps);
  return (
    <VizPlayer
      title="Two pointers — pair with target sum"
      complexity={{ time: "O(n)", space: "O(1)" }}
      stepper={stepper}
      inputs={
        <>
          <VizField label="array (auto-sorted)" wide value={arr.text} onChange={arr.setText} onCommit={arr.commit} error={arr.error} />
          <VizField label="target sum" value={target.text} onChange={target.setText} onCommit={target.commit} />
        </>
      }
    >
      <ArrayCanvas step={stepper.step} />
    </VizPlayer>
  );
}

function SlidingWindowViz() {
  const arr = useNumsInput([4, 2, 9, 7, 5, 1, 8, 6, 3]);
  const k = useIntInput(3);
  const steps = useMemo(
    () => slidingWindowSteps(arr.nums, k.value),
    [arr.nums, k.value],
  );
  const stepper = useStepper(steps);
  return (
    <VizPlayer
      title="Sliding window — max sum of k elements"
      complexity={{ time: "O(n)", space: "O(1)" }}
      stepper={stepper}
      inputs={
        <>
          <VizField label="array" wide value={arr.text} onChange={arr.setText} onCommit={arr.commit} error={arr.error} />
          <VizField label="window k" value={k.text} onChange={k.setText} onCommit={k.commit} />
        </>
      }
    >
      <ArrayCanvas step={stepper.step} />
    </VizPlayer>
  );
}

/* ── Stack / queue ────────────────────────────────────────────────────── */

function BoxesViz({ mode }: { mode: "stack" | "queue" }) {
  const verb = mode === "stack" ? "push" : "enqueue";
  const out = mode === "stack" ? "pop" : "dequeue";
  const [text, setText] = useState(
    `${verb} 4, ${verb} 8, ${verb} 15, ${out}, ${verb} 16, ${out}, ${out}`,
  );
  const [ops, setOps] = useState(() => parseOps(text));
  const [error, setError] = useState<string | null>(null);
  const commit = () => {
    const parsed = parseOps(text);
    if (parsed.length === 0) {
      setError(`Use “${verb} <n>” and “${out}”, comma-separated`);
      return;
    }
    setError(null);
    setOps(parsed);
  };
  const steps = useMemo(
    () => (mode === "stack" ? stackSteps(ops) : queueSteps(ops)),
    [mode, ops],
  );
  const stepper = useStepper(steps);
  return (
    <VizPlayer
      title={mode === "stack" ? "Stack (LIFO)" : "Queue (FIFO)"}
      complexity={{ time: "O(1) per op", space: "O(n)" }}
      stepper={stepper}
      inputs={
        <VizField
          label={`operations (${verb} n / ${out})`}
          wide
          value={text}
          onChange={setText}
          onCommit={commit}
          error={error}
        />
      }
    >
      <BoxesCanvas step={stepper.step} mode={mode} />
    </VizPlayer>
  );
}

/* ── Linked list ──────────────────────────────────────────────────────── */

function ListViz() {
  const arr = useNumsInput([3, 8, 12, 27, 41]);
  const steps = useMemo(() => reverseListSteps(arr.nums.slice(0, 7)), [arr.nums]);
  const stepper = useStepper(steps);
  return (
    <VizPlayer
      title="Reverse a linked list (iterative)"
      complexity={{ time: "O(n)", space: "O(1)" }}
      stepper={stepper}
      inputs={
        <VizField label="list values (≤ 7)" wide value={arr.text} onChange={arr.setText} onCommit={arr.commit} error={arr.error} />
      }
    >
      <ListCanvas step={stepper.step} />
    </VizPlayer>
  );
}

/* ── BST & heap ───────────────────────────────────────────────────────── */

function BstViz() {
  const arr = useNumsInput([50, 30, 70, 20, 40, 60, 80, 35]);
  const target = useIntInput(40);
  const steps = useMemo(
    () => bstSteps(arr.nums, target.value),
    [arr.nums, target.value],
  );
  const stepper = useStepper(steps);
  return (
    <VizPlayer
      title="Binary search tree — insert, then search"
      complexity={{ time: "O(log n) avg", space: "O(h)" }}
      stepper={stepper}
      inputs={
        <>
          <VizField label="insert order" wide value={arr.text} onChange={arr.setText} onCommit={arr.commit} error={arr.error} />
          <VizField label="search for" value={target.text} onChange={target.setText} onCommit={target.commit} />
        </>
      }
    >
      <TreeCanvas step={stepper.step} />
    </VizPlayer>
  );
}

function HeapViz() {
  const arr = useNumsInput([42, 17, 33, 8, 25, 4, 51]);
  const steps = useMemo(() => heapSteps(arr.nums), [arr.nums]);
  const stepper = useStepper(steps);
  return (
    <VizPlayer
      title="Min-heap — push all, then extract-min"
      complexity={{ time: "O(log n) per op", space: "O(1) aux" }}
      stepper={stepper}
      inputs={
        <VizField label="push order" wide value={arr.text} onChange={arr.setText} onCommit={arr.commit} error={arr.error} />
      }
    >
      <HeapCanvas step={stepper.step} />
    </VizPlayer>
  );
}

/* ── Graph traversals ─────────────────────────────────────────────────── */

const GRAPH_META: Record<
  "bfs" | "dfs" | "dijkstra",
  { title: string; complexity: Complexity }
> = {
  bfs: { title: "Breadth-first search", complexity: { time: "O(V + E)", space: "O(V)" } },
  dfs: { title: "Depth-first search", complexity: { time: "O(V + E)", space: "O(V)" } },
  dijkstra: {
    title: "Dijkstra — shortest paths",
    complexity: { time: "O((V+E) log V)", space: "O(V)" },
  },
};

/* ── Dynamic programming ──────────────────────────────────────────────── */

type DpProblem = "fib" | "coins" | "paths" | "lcs";

const DP_META: Record<DpProblem, { label: string; complexity: Complexity }> = {
  fib: { label: "Fibonacci", complexity: { time: "O(n)", space: "O(n)" } },
  coins: { label: "Coin change", complexity: { time: "O(amount · coins)", space: "O(amount)" } },
  paths: { label: "Grid paths", complexity: { time: "O(r · c)", space: "O(r · c)" } },
  lcs: { label: "LCS", complexity: { time: "O(m · n)", space: "O(m · n)" } },
};

function DpViz({ initial }: { initial?: string }) {
  const [problem, setProblem] = useState<DpProblem>(
    (["fib", "coins", "paths", "lcs"] as const).includes(initial as DpProblem)
      ? (initial as DpProblem)
      : "fib",
  );
  const n = useIntInput(9);
  const coins = useNumsInput([1, 2, 5]);
  const amount = useIntInput(11);
  const rows = useIntInput(4);
  const cols = useIntInput(5);
  const [s1, setS1] = useState("ABCBDAB");
  const [s2, setS2] = useState("BDCAB");
  const [lcsIn, setLcsIn] = useState({ s1: "ABCBDAB", s2: "BDCAB" });

  const steps = useMemo(() => {
    switch (problem) {
      case "fib":
        return fibSteps(n.value);
      case "coins":
        return coinChangeSteps(coins.nums, amount.value);
      case "paths":
        return gridPathsSteps(rows.value, cols.value);
      case "lcs":
        return lcsSteps(lcsIn.s1, lcsIn.s2);
    }
  }, [problem, n.value, coins.nums, amount.value, rows.value, cols.value, lcsIn]);
  const stepper = useStepper(steps);

  return (
    <VizPlayer
      title={`Dynamic programming — ${DP_META[problem].label}`}
      complexity={DP_META[problem].complexity}
      stepper={stepper}
      inputs={
        <>
          <PillSelect
            label="problem"
            options={(Object.keys(DP_META) as DpProblem[]).map((id) => ({ id, label: DP_META[id].label }))}
            value={problem}
            onChange={setProblem}
          />
          {problem === "fib" && (
            <VizField label="n (2–12)" value={n.text} onChange={n.setText} onCommit={n.commit} />
          )}
          {problem === "coins" && (
            <>
              <VizField label="coins" value={coins.text} onChange={coins.setText} onCommit={coins.commit} error={coins.error} />
              <VizField label="amount (≤12)" value={amount.text} onChange={amount.setText} onCommit={amount.commit} />
            </>
          )}
          {problem === "paths" && (
            <>
              <VizField label="rows (2–5)" value={rows.text} onChange={rows.setText} onCommit={rows.commit} />
              <VizField label="cols (2–6)" value={cols.text} onChange={cols.setText} onCommit={cols.commit} />
            </>
          )}
          {problem === "lcs" && (
            <>
              <VizField label="string 1 (≤7)" value={s1} onChange={setS1} onCommit={() => setLcsIn({ s1, s2 })} />
              <VizField label="string 2 (≤6)" value={s2} onChange={setS2} onCommit={() => setLcsIn({ s1, s2 })} />
            </>
          )}
        </>
      }
    >
      <DpCanvas step={stepper.step} />
    </VizPlayer>
  );
}

/* ── Backtracking ─────────────────────────────────────────────────────── */

function NQueensViz() {
  // n=4 is the default on purpose: its first solution requires real
  // backtracking (queens get lifted), which is the thing being taught.
  const [n, setN] = useState(4);
  const steps = useMemo(() => nQueensSteps(n), [n]);
  const stepper = useStepper(steps);
  return (
    <VizPlayer
      title="Backtracking — N-Queens"
      complexity={{ time: "O(n!) pruned", space: "O(n)" }}
      stepper={stepper}
      inputs={
        <PillSelect
          label="board size"
          options={[4, 5, 6].map((v) => ({ id: String(v), label: `${v}×${v}` }))}
          value={String(n)}
          onChange={(v) => setN(Number(v))}
        />
      }
    >
      <BoardCanvas step={stepper.step} />
    </VizPlayer>
  );
}

function SubsetsViz() {
  const arr = useNumsInput([1, 2, 3]);
  const steps = useMemo(() => subsetsSteps(arr.nums), [arr.nums]);
  const stepper = useStepper(steps);
  return (
    <VizPlayer
      title="Backtracking — all subsets"
      complexity={{ time: "O(2ⁿ)", space: "O(n)" }}
      stepper={stepper}
      inputs={
        <VizField label="values (≤ 4)" wide value={arr.text} onChange={arr.setText} onCommit={arr.commit} error={arr.error} />
      }
    >
      <SubsetsCanvas step={stepper.step} />
    </VizPlayer>
  );
}

/* ── Hash table ───────────────────────────────────────────────────────── */

function HashViz() {
  const keys = useNumsInput([12, 25, 35, 26, 19, 44, 33]);
  const m = useIntInput(7);
  const lookup = useIntInput(26);
  const steps = useMemo(
    () => hashTableSteps(keys.nums, m.value, lookup.value),
    [keys.nums, m.value, lookup.value],
  );
  const stepper = useStepper(steps);
  return (
    <VizPlayer
      title="Hash table — insert & lookup (chaining)"
      complexity={{ time: "O(1) average", space: "O(n)" }}
      stepper={stepper}
      inputs={
        <>
          <VizField label="keys" wide value={keys.text} onChange={keys.setText} onCommit={keys.commit} error={keys.error} />
          <VizField label="drawers (3–10)" value={m.text} onChange={m.setText} onCommit={m.commit} />
          <VizField label="look up" value={lookup.text} onChange={lookup.setText} onCommit={lookup.commit} />
        </>
      }
    >
      <HashCanvas step={stepper.step} />
    </VizPlayer>
  );
}

/* ── Trie ─────────────────────────────────────────────────────────────── */

function TrieViz() {
  const [wordsText, setWordsText] = useState("car, cat, card, do, dog");
  const [queryText, setQueryText] = useState("ca");
  const [committed, setCommitted] = useState({ words: ["car", "cat", "card", "do", "dog"], query: "ca" });
  const commit = () =>
    setCommitted({
      words: wordsText.split(/[,\s]+/).filter(Boolean),
      query: queryText.trim() || "ca",
    });
  const steps = useMemo(
    () => trieSteps(committed.words, committed.query),
    [committed],
  );
  const stepper = useStepper(steps);
  return (
    <VizPlayer
      title="Trie — insert words, then look one up"
      complexity={{ time: "O(word length)", space: "O(total letters)" }}
      stepper={stepper}
      inputs={
        <>
          <VizField label="words (≤ 6)" wide value={wordsText} onChange={setWordsText} onCommit={commit} />
          <VizField label="look up" value={queryText} onChange={setQueryText} onCommit={commit} />
        </>
      }
    >
      <TrieCanvas step={stepper.step} />
    </VizPlayer>
  );
}

/* ── Union-Find ───────────────────────────────────────────────────────── */

function UnionFindViz() {
  const N = 8;
  const [text, setText] = useState("union 0 1, union 2 3, union 1 3, union 4 5, union 6 7, union 5 7, find 0, union 3 7");
  const [ops, setOps] = useState(() => parseUfOps(text, N));
  const [error, setError] = useState<string | null>(null);
  const commit = () => {
    const parsed = parseUfOps(text, N);
    if (parsed.length === 0) {
      setError(`Use "union a b" / "find a" with 0 ≤ a,b < ${N}`);
      return;
    }
    setError(null);
    setOps(parsed);
  };
  const steps = useMemo(() => unionFindSteps(N, ops), [ops]);
  const stepper = useStepper(steps);
  return (
    <VizPlayer
      title="Union-Find — groups, leaders & path compression"
      complexity={{ time: "≈O(1) per op", space: "O(n)" }}
      stepper={stepper}
      inputs={
        <VizField label="operations (union a b / find a)" wide value={text} onChange={setText} onCommit={commit} error={error} />
      }
    >
      <UfCanvas step={stepper.step} />
    </VizPlayer>
  );
}

/* ── Intervals (greedy & merge) ───────────────────────────────────────── */

function IntervalsViz({ kind }: { kind: "activity" | "merge" }) {
  const defaults = kind === "activity" ? "1-4, 3-5, 0-6, 5-7, 3-9, 5-9, 6-10, 8-11" : "1-3, 2-6, 8-10, 15-18, 17-20";
  const [text, setText] = useState(defaults);
  const [intervals, setIntervals] = useState(() => parseIntervals(defaults));
  const [error, setError] = useState<string | null>(null);
  const commit = () => {
    const parsed = parseIntervals(text);
    if (parsed.length < 2) {
      setError('Use "start-end" pairs, e.g. "1-4, 3-5" (end ≤ 24)');
      return;
    }
    setError(null);
    setIntervals(parsed);
  };
  const steps = useMemo(
    () => (kind === "activity" ? activitySelectionSteps(intervals) : mergeIntervalsSteps(intervals)),
    [kind, intervals],
  );
  const stepper = useStepper(steps);
  return (
    <VizPlayer
      title={kind === "activity" ? "Greedy — most meetings in one room" : "Merge overlapping intervals"}
      complexity={{ time: "O(n log n)", space: kind === "activity" ? "O(1)" : "O(n)" }}
      stepper={stepper}
      inputs={
        <VizField label="meetings (start-end)" wide value={text} onChange={setText} onCommit={commit} error={error} />
      }
    >
      <IntervalCanvas step={stepper.step} />
    </VizPlayer>
  );
}

/* ── String matching ──────────────────────────────────────────────────── */

function MatchViz({ initial }: { initial?: string }) {
  const [mode, setMode] = useState<"naive" | "kmp">(initial === "kmp" ? "kmp" : "naive");
  const [textIn, setTextIn] = useState("ABABABCABABABD");
  const [patIn, setPatIn] = useState("ABABD");
  const [committed, setCommitted] = useState({ t: "ABABABCABABABD", p: "ABABD" });
  const commit = () => setCommitted({ t: textIn, p: patIn });
  const steps = useMemo(
    () => (mode === "naive" ? naiveSearchSteps(committed.t, committed.p) : kmpSteps(committed.t, committed.p)),
    [mode, committed],
  );
  const stepper = useStepper(steps);
  return (
    <VizPlayer
      title={mode === "naive" ? "Substring search — the obvious way" : "Substring search — KMP"}
      complexity={mode === "naive" ? { time: "O(n · m)", space: "O(1)" } : { time: "O(n + m)", space: "O(m)" }}
      stepper={stepper}
      inputs={
        <>
          <PillSelect
            label="method"
            options={[
              { id: "naive" as const, label: "Naive" },
              { id: "kmp" as const, label: "KMP" },
            ]}
            value={mode}
            onChange={setMode}
          />
          <VizField label="text (≤ 16)" wide value={textIn} onChange={setTextIn} onCommit={commit} />
          <VizField label="pattern (≤ 8)" value={patIn} onChange={setPatIn} onCommit={commit} />
        </>
      }
    >
      <MatchCanvas step={stepper.step} />
    </VizPlayer>
  );
}

/* ── Tree traversals ──────────────────────────────────────────────────── */

const TRAVERSALS: { id: TraversalKind; label: string }[] = [
  { id: "inorder", label: "In-order" },
  { id: "preorder", label: "Pre-order" },
  { id: "postorder", label: "Post-order" },
  { id: "level", label: "Level-order" },
];

function TraversalViz({ initial }: { initial?: string }) {
  const [kind, setKind] = useState<TraversalKind>(
    TRAVERSALS.some((t) => t.id === initial) ? (initial as TraversalKind) : "inorder",
  );
  const arr = useNumsInput([50, 30, 70, 20, 40, 60, 80]);
  const steps = useMemo(() => traversalSteps(arr.nums, kind), [arr.nums, kind]);
  const stepper = useStepper(steps);
  return (
    <VizPlayer
      title={`Tree traversal — ${TRAVERSALS.find((t) => t.id === kind)!.label}`}
      complexity={{ time: "O(n)", space: "O(h)" }}
      stepper={stepper}
      inputs={
        <>
          <PillSelect label="order" options={TRAVERSALS} value={kind} onChange={setKind} />
          <VizField label="BST insert order" wide value={arr.text} onChange={arr.setText} onCommit={arr.commit} error={arr.error} />
        </>
      }
    >
      <TreeCanvas step={stepper.step} />
    </VizPlayer>
  );
}

/* ── Prefix sums & Fenwick ────────────────────────────────────────────── */

function PrefixSumViz() {
  const arr = useNumsInput([3, 8, 2, 5, 7, 4, 1, 6]);
  const qi = useIntInput(2);
  const qj = useIntInput(5);
  const steps = useMemo(
    () => prefixSumSteps(arr.nums, qi.value, qj.value),
    [arr.nums, qi.value, qj.value],
  );
  const stepper = useStepper(steps);
  return (
    <VizPlayer
      title="Prefix sums — range totals in O(1)"
      complexity={{ time: "O(n) build, O(1) query", space: "O(n)" }}
      stepper={stepper}
      inputs={
        <>
          <VizField label="array" wide value={arr.text} onChange={arr.setText} onCommit={arr.commit} error={arr.error} />
          <VizField label="from i" value={qi.text} onChange={qi.setText} onCommit={qi.commit} />
          <VizField label="to j" value={qj.text} onChange={qj.setText} onCommit={qj.commit} />
        </>
      }
    >
      <DpCanvas step={stepper.step} />
    </VizPlayer>
  );
}

function FenwickViz() {
  const arr = useNumsInput([3, 8, 2, 5, 7, 4, 1, 6]);
  const k = useIntInput(6);
  const steps = useMemo(() => fenwickSteps(arr.nums, k.value), [arr.nums, k.value]);
  const stepper = useStepper(steps);
  return (
    <VizPlayer
      title="Fenwick tree — updatable prefix sums"
      complexity={{ time: "O(log n) per op", space: "O(n)" }}
      stepper={stepper}
      inputs={
        <>
          <VizField label="values (≤ 8)" wide value={arr.text} onChange={arr.setText} onCommit={arr.commit} error={arr.error} />
          <VizField label="query a[1..k]" value={k.text} onChange={k.setText} onCommit={k.commit} />
        </>
      }
    >
      <DpCanvas step={stepper.step} />
    </VizPlayer>
  );
}

/* ── Graph traversals ─────────────────────────────────────────────────── */

function GraphViz({ kind }: { kind: "bfs" | "dfs" | "dijkstra" }) {
  const graph = kind === "dijkstra" ? WEIGHTED_GRAPH : DEMO_GRAPH;
  const [start, setStart] = useState("A");
  const steps = useMemo(() => {
    if (kind === "bfs") return bfsSteps(graph, start);
    if (kind === "dfs") return dfsSteps(graph, start);
    return dijkstraSteps(graph, start);
  }, [kind, graph, start]);
  const stepper = useStepper(steps);
  return (
    <VizPlayer
      title={GRAPH_META[kind].title}
      complexity={GRAPH_META[kind].complexity}
      stepper={stepper}
      inputs={
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-medium uppercase tracking-wide text-faint">
            start node
          </span>
          <div className="flex flex-wrap gap-1 rounded-lg border border-line p-0.5">
            {graph.nodes.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => setStart(n.id)}
                className={cn(
                  "rounded-md px-2 py-1 font-mono text-[11px] font-medium transition-colors",
                  start === n.id ? "bg-brand-600/30 text-brand-300" : "text-faint hover:text-subtle",
                )}
              >
                {n.id}
              </button>
            ))}
          </div>
        </div>
      }
    >
      <GraphCanvas graph={graph} step={stepper.step} />
    </VizPlayer>
  );
}
