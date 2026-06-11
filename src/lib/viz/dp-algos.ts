import type { DpStep, Tone } from "./types";

/**
 * Dynamic programming visualizers. The shared idea, jargon-free:
 * write down the answer to every small version of the problem in a table,
 * and build each new answer out of answers you already wrote down.
 * "DP" is just: never solve the same small problem twice.
 */

const key = (r: number, c: number) => `${r},${c}`;

/* ── Fibonacci (1 row) ────────────────────────────────────────────────── */

export function fibSteps(n: number): DpStep[] {
  n = Math.max(2, Math.min(n, 12));
  const cols = Array.from({ length: n + 1 }, (_, i) => `${i}`);
  const row: (number | null)[] = Array(n + 1).fill(null);
  const steps: DpStep[] = [];

  steps.push({
    grid: [[...row]],
    colLabels: cols,
    rowLabels: ["fib"],
    note: `Goal: the ${n}th Fibonacci number. Naive recursion recomputes the same values millions of times — instead we'll fill a table once, left to right.`,
  });

  row[0] = 0;
  row[1] = 1;
  steps.push({
    grid: [[...row]],
    colLabels: cols,
    rowLabels: ["fib"],
    tones: { [key(0, 0)]: "good", [key(0, 1)]: "good" },
    note: "Base cases — answers so small we just know them: fib(0) = 0, fib(1) = 1.",
  });

  for (let i = 2; i <= n; i++) {
    steps.push({
      grid: [[...row]],
      colLabels: cols,
      rowLabels: ["fib"],
      tones: { [key(0, i - 2)]: "focus", [key(0, i - 1)]: "focus", [key(0, i)]: "active" },
      note: `fib(${i}) = fib(${i - 1}) + fib(${i - 2}) = ${row[i - 1]} + ${row[i - 2]}. Both answers are already in the table — just read them, no recomputing.`,
      vars: [["i", i]],
    });
    row[i] = (row[i - 1] as number) + (row[i - 2] as number);
    steps.push({
      grid: [[...row]],
      colLabels: cols,
      rowLabels: ["fib"],
      tones: { [key(0, i)]: "good" },
      note: `Write it down: fib(${i}) = ${row[i]}. Each cell costs one addition — ${n + 1} cells total, so O(n) instead of exponential.`,
    });
  }

  steps.push({
    grid: [[...row]],
    colLabels: cols,
    rowLabels: ["fib"],
    tones: { [key(0, n)]: "good" },
    note: `Done: fib(${n}) = ${row[n]}. The whole trick was a notebook: solve each small case once, look it up forever after.`,
    vars: [["answer", row[n] as number]],
  });
  return steps;
}

/* ── Coin change: fewest coins to make an amount (1 row) ─────────────── */

export function coinChangeSteps(coins: number[], amount: number): DpStep[] {
  coins = [...new Set(coins.filter((c) => c > 0))].sort((a, b) => a - b).slice(0, 5);
  amount = Math.max(1, Math.min(amount, 12));
  if (coins.length === 0) coins = [1, 2, 5];

  const INF = Infinity;
  const dp: number[] = Array(amount + 1).fill(INF);
  dp[0] = 0;
  const show = (): (number | string | null)[][] => [
    dp.map((v) => (v === INF ? "·" : v)),
  ];
  const cols = Array.from({ length: amount + 1 }, (_, i) => `${i}`);
  const steps: DpStep[] = [];

  steps.push({
    grid: show(),
    colLabels: cols,
    rowLabels: ["min"],
    tones: { [key(0, 0)]: "good" },
    note: `Fewest coins to pay each amount from 0 to ${amount}, using coins {${coins.join(", ")}}. Amount 0 needs 0 coins; "·" means "no way found yet".`,
  });

  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c > a) continue;
      const cand = dp[a - c] === INF ? INF : dp[a - c] + 1;
      const better = cand < dp[a];
      steps.push({
        grid: show(),
        colLabels: cols,
        rowLabels: ["min"],
        tones: { [key(0, a)]: "active", [key(0, a - c)]: better ? "focus" : "muted" },
        note:
          dp[a - c] === INF
            ? `Pay ${a}: try a ${c}-coin last. But amount ${a - c} has no answer yet, so this path is a dead end.`
            : `Pay ${a}: if the last coin is a ${c}, the rest is amount ${a - c}, already solved with ${dp[a - c]} coin${dp[a - c] === 1 ? "" : "s"} → ${cand} total. ${better ? "Best so far — keep it." : `Not better than ${dp[a]}.`}`,
        vars: [["amount", a], ["coin", c]],
      });
      if (better) dp[a] = cand;
    }
    steps.push({
      grid: show(),
      colLabels: cols,
      rowLabels: ["min"],
      tones: { [key(0, a)]: dp[a] === INF ? "bad" : "good" },
      note:
        dp[a] === INF
          ? `Amount ${a} can't be made with these coins.`
          : `Settled: amount ${a} needs ${dp[a]} coin${dp[a] === 1 ? "" : "s"}. Every later amount can now reuse this answer.`,
    });
  }

  steps.push({
    grid: show(),
    colLabels: cols,
    rowLabels: ["min"],
    tones: { [key(0, amount)]: dp[amount] === INF ? "bad" : "good" },
    note:
      dp[amount] === INF
        ? `No combination of {${coins.join(", ")}} makes ${amount}.`
        : `Answer: ${amount} needs ${dp[amount]} coins. Greedy "always grab the biggest coin" fails on cases like coins {1, 3, 4}, amount 6 — the table never does, because it tries every last-coin choice.`,
    vars: [["answer", dp[amount] === INF ? -1 : dp[amount]]],
  });
  return steps;
}

/* ── Unique grid paths (2D) ───────────────────────────────────────────── */

export function gridPathsSteps(rows: number, cols: number): DpStep[] {
  rows = Math.max(2, Math.min(rows, 5));
  cols = Math.max(2, Math.min(cols, 6));
  const dp: (number | null)[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(null),
  );
  const steps: DpStep[] = [];
  const snap = () => dp.map((r) => [...r]);

  steps.push({
    grid: snap(),
    note: `A robot walks from the top-left to the bottom-right of a ${rows}×${cols} grid, moving only right or down. How many different routes exist? Counting them by hand explodes — so we count per cell.`,
  });

  for (let c = 0; c < cols; c++) dp[0][c] = 1;
  for (let r = 0; r < rows; r++) dp[r][0] = 1;
  steps.push({
    grid: snap(),
    tones: Object.fromEntries([
      ...Array.from({ length: cols }, (_, c) => [key(0, c), "good"]),
      ...Array.from({ length: rows }, (_, r) => [key(r, 0), "good"]),
    ]) as Record<string, Tone>,
    note: "Edges first: along the top row or left column there's exactly 1 route (straight line, no choices). These are the base cases.",
  });

  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      steps.push({
        grid: snap(),
        tones: { [key(r, c)]: "active", [key(r - 1, c)]: "focus", [key(r, c - 1)]: "focus" },
        note: `Every route into this cell arrives from above (${dp[r - 1][c]} routes) or from the left (${dp[r][c - 1]} routes) — and those two groups can't overlap. So: add them.`,
        vars: [["row", r], ["col", c]],
      });
      dp[r][c] = (dp[r - 1][c] as number) + (dp[r][c - 1] as number);
      steps.push({
        grid: snap(),
        tones: { [key(r, c)]: "good" },
        note: `${dp[r - 1][c]} + ${dp[r][c - 1]} = ${dp[r][c]} routes reach this cell.`,
      });
    }
  }

  steps.push({
    grid: snap(),
    tones: { [key(rows - 1, cols - 1)]: "good" },
    note: `Answer: ${dp[rows - 1][cols - 1]} routes. ${rows * cols} cells, one addition each — O(rows × cols). The recursive version without the table would redo work exponentially.`,
    vars: [["answer", dp[rows - 1][cols - 1] as number]],
  });
  return steps;
}

/* ── Longest common subsequence (2D) ──────────────────────────────────── */

export function lcsSteps(s1: string, s2: string): DpStep[] {
  s1 = s1.replace(/\s/g, "").slice(0, 7).toUpperCase();
  s2 = s2.replace(/\s/g, "").slice(0, 6).toUpperCase();
  if (!s1) s1 = "ABCBDAB";
  if (!s2) s2 = "BDCAB";
  const m = s1.length;
  const n = s2.length;
  const dp: (number | null)[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(null),
  );
  const rowLabels = ["∅", ...s1.split("")];
  const colLabels = ["∅", ...s2.split("")];
  const steps: DpStep[] = [];
  const snap = () => dp.map((r) => [...r]);

  steps.push({
    grid: snap(),
    rowLabels,
    colLabels,
    note: `Longest common subsequence of "${s1}" and "${s2}" — the longest set of letters appearing in both, in order (gaps allowed). Cell (i, j) will answer: "LCS of the first i letters of one and first j of the other".`,
  });

  for (let i = 0; i <= m; i++) dp[i][0] = 0;
  for (let j = 0; j <= n; j++) dp[0][j] = 0;
  steps.push({
    grid: snap(),
    rowLabels,
    colLabels,
    note: "Base cases: against an empty string (∅ row/column) the common part is always 0 letters.",
  });

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const match = s1[i - 1] === s2[j - 1];
      if (match) {
        steps.push({
          grid: snap(),
          rowLabels,
          colLabels,
          tones: { [key(i, j)]: "active", [key(i - 1, j - 1)]: "focus" },
          note: `'${s1[i - 1]}' = '${s2[j - 1]}' — the letters match! Extend the best answer from the diagonal (without these letters): ${dp[i - 1][j - 1]} + 1.`,
          vars: [["i", i], ["j", j]],
        });
        dp[i][j] = (dp[i - 1][j - 1] as number) + 1;
      } else {
        steps.push({
          grid: snap(),
          rowLabels,
          colLabels,
          tones: { [key(i, j)]: "active", [key(i - 1, j)]: "focus", [key(i, j - 1)]: "focus" },
          note: `'${s1[i - 1]}' ≠ '${s2[j - 1]}' — no match, so drop one letter or the other and keep the better answer: max(${dp[i - 1][j]}, ${dp[i][j - 1]}).`,
          vars: [["i", i], ["j", j]],
        });
        dp[i][j] = Math.max(dp[i - 1][j] as number, dp[i][j - 1] as number);
      }
      steps.push({
        grid: snap(),
        rowLabels,
        colLabels,
        tones: { [key(i, j)]: match ? "good" : "idle" },
        note: `Cell (${i}, ${j}) = ${dp[i][j]}.`,
      });
    }
  }

  steps.push({
    grid: snap(),
    rowLabels,
    colLabels,
    tones: { [key(m, n)]: "good" },
    note: `Answer: the LCS has ${dp[m][n]} letters. ${m}×${n} small questions, each answered in O(1) from neighbours — O(m·n) total. This exact table powers diff tools and git merge.`,
    vars: [["answer", dp[m][n] as number]],
  });
  return steps;
}

/* ── Prefix sums (reuses the table canvas: 2 rows) ────────────────────── */

export function prefixSumSteps(values: number[], qi: number, qj: number): DpStep[] {
  const a = values.slice(0, 10);
  const n = a.length;
  qi = Math.max(0, Math.min(qi, n - 1));
  qj = Math.max(qi, Math.min(qj, n - 1));
  const prefix: (number | null)[] = Array(n + 1).fill(null);
  const steps: DpStep[] = [];
  const grid = (): (number | string | null)[][] => [
    [...a.map(String), ""],
    [...prefix],
  ];
  const colLabels = Array.from({ length: n + 1 }, (_, i) => `${i}`);
  const rowLabels = ["a", "sum"];

  steps.push({
    grid: grid(),
    rowLabels,
    colLabels,
    note: `Question: "what's the total of a[${qi}..${qj}]?" — asked many times. Re-adding the slice each time costs O(n) per question. Build a running-total row once instead.`,
  });

  prefix[0] = 0;
  steps.push({
    grid: grid(),
    rowLabels,
    colLabels,
    tones: { [key(1, 0)]: "good" },
    note: "sum[0] = 0: the total of 'nothing so far'.",
  });
  for (let i = 0; i < n; i++) {
    prefix[i + 1] = (prefix[i] as number) + a[i];
    steps.push({
      grid: grid(),
      rowLabels,
      colLabels,
      tones: { [key(1, i + 1)]: "active", [key(1, i)]: "focus", [key(0, i)]: "focus" },
      note: `sum[${i + 1}] = sum[${i}] + a[${i}] = ${prefix[i]} + ${a[i]} = ${prefix[i + 1]} — the total of everything before index ${i + 1}.`,
    });
  }

  const ans = (prefix[qj + 1] as number) - (prefix[qi] as number);
  steps.push({
    grid: grid(),
    rowLabels,
    colLabels,
    tones: {
      [key(1, qj + 1)]: "good",
      [key(1, qi)]: "bad",
      ...Object.fromEntries(
        Array.from({ length: qj - qi + 1 }, (_, k) => [key(0, qi + k), "accent"]),
      ),
    },
    note: `Now any range is one subtraction: a[${qi}..${qj}] = sum[${qj + 1}] − sum[${qi}] = ${prefix[qj + 1]} − ${prefix[qi]} = ${ans}. "Everything up to the end" minus "everything before the start". O(1) per question, forever.`,
    vars: [["answer", ans]],
  });
  return steps;
}

/* ── Fenwick tree (binary indexed tree) ───────────────────────────────── */

export function fenwickSteps(values: number[], queryUpTo: number): DpStep[] {
  const a = values.slice(0, 8);
  const n = a.length;
  queryUpTo = Math.max(1, Math.min(queryUpTo, n));
  const bit: number[] = Array(n + 1).fill(0);
  const steps: DpStep[] = [];
  const grid = (): (number | string | null)[][] => [
    ["", ...a.map(String)],
    [...bit.map(String)],
  ];
  const colLabels = Array.from({ length: n + 1 }, (_, i) => `${i}`);
  const rowLabels = ["a", "tree"];

  steps.push({
    grid: grid(),
    rowLabels,
    colLabels,
    note: `Prefix sums answer range questions in O(1) — but one value change forces rebuilding the whole row. The Fenwick tree is the compromise: each slot stores the total of a *block* of values, and both update and query touch only O(log n) slots.`,
  });

  for (let idx = 1; idx <= n; idx++) {
    const v = a[idx - 1];
    let i = idx;
    const touched: number[] = [];
    while (i <= n) {
      bit[i] += v;
      touched.push(i);
      i += i & -i;
    }
    steps.push({
      grid: grid(),
      rowLabels,
      colLabels,
      tones: {
        [key(0, idx)]: "focus",
        ...Object.fromEntries(touched.map((t) => [key(1, t), "accent"])),
      },
      note: `Add a[${idx}] = ${v}: it belongs to block${touched.length === 1 ? "" : "s"} ${touched.join(", ")}. (Each jump adds the lowest set bit of the index: ${touched.join(" → ")}.) Only ${touched.length} slot${touched.length === 1 ? "" : "s"} touched, not all of them.`,
      vars: [["index", idx], ["value", v]],
    });
  }

  let i = queryUpTo;
  let sum = 0;
  const path: number[] = [];
  while (i > 0) {
    sum += bit[i];
    path.push(i);
    i -= i & -i;
  }
  steps.push({
    grid: grid(),
    rowLabels,
    colLabels,
    tones: Object.fromEntries(path.map((p) => [key(1, p), "good"])) as Record<string, Tone>,
    note: `Query "total of a[1..${queryUpTo}]": hop down the blocks ${path.join(" → ")} (each hop removes the lowest set bit) and add them: ${sum}. ${path.length} reads instead of ${queryUpTo}.`,
    vars: [["answer", sum]],
  });

  const check = a.slice(0, queryUpTo).reduce((x, y) => x + y, 0);
  steps.push({
    grid: grid(),
    rowLabels,
    colLabels,
    tones: Object.fromEntries(path.map((p) => [key(1, p), "good"])) as Record<string, Tone>,
    note: `Sanity check by brute force: ${a.slice(0, queryUpTo).join(" + ")} = ${check}. ✓ Updates and queries are both O(log n) — the structure behind live leaderboards and counting problems.`,
    vars: [["answer", sum], ["brute force", check]],
  });
  return steps;
}
