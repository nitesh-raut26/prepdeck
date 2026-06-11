import type { BoardStep, SubsetStep } from "./types";

/**
 * Backtracking, jargon-free: explore choices like walking a maze.
 * Try a choice → check if it's still legal → go deeper.
 * Hit a dead end → step back (undo the choice) → try the next option.
 * The "undo" is the whole trick — it's what lets one walker explore
 * every path without cloning the world.
 */

/* ── N-Queens (stops at the first solution) ───────────────────────────── */

export function nQueensSteps(n: number): BoardStep[] {
  n = Math.max(4, Math.min(n, 6));
  const steps: BoardStep[] = [];
  const queens: { r: number; c: number }[] = [];
  let found = false;

  const snap = (
    tones: BoardStep["tones"],
    note: string,
    vars?: BoardStep["vars"],
  ) =>
    steps.push({ n, queens: queens.map((q) => ({ ...q })), tones, note, vars });

  snap(
    {},
    `Place ${n} queens on a ${n}×${n} board so none can attack another (no shared row, column or diagonal). Brute force would test every arrangement; backtracking abandons bad ones early. One queen per row — row by row.`,
  );

  const conflict = (r: number, c: number) =>
    queens.find(
      (q) => q.c === c || Math.abs(q.r - r) === Math.abs(q.c - c),
    );

  function place(r: number): boolean {
    if (r === n) {
      found = true;
      snap(
        Object.fromEntries(queens.map((q) => [`${q.r},${q.c}`, "good"])),
        `All ${n} rows filled with no conflicts — a solution! Backtracking got here through ${steps.length} board states, a tiny corner of all ${n}^${n} = ${(n ** n).toLocaleString()} possible arrangements — pruning did the rest.`,
      );
      return true;
    }
    for (let c = 0; c < n; c++) {
      const clash = conflict(r, c);
      if (clash) {
        snap(
          {
            [`${r},${c}`]: "bad",
            [`${clash.r},${clash.c}`]: "accent",
          },
          `Try row ${r}, column ${c} — attacked by the queen at (${clash.r}, ${clash.c}) ${clash.c === c ? "(same column)" : "(same diagonal)"}. Don't even go deeper: prune this branch.`,
          [["row", r], ["col", c]],
        );
        continue;
      }
      queens.push({ r, c });
      snap(
        { [`${r},${c}`]: "good" },
        `(${r}, ${c}) is safe — CHOOSE: place a queen and move to row ${r + 1}.`,
        [["row", r], ["col", c]],
      );
      if (place(r + 1)) return true;
      queens.pop();
      snap(
        { [`${r},${c}`]: "muted" },
        `Every column in row ${r + 1} failed below this point — dead end. UNDO: lift the queen off (${r}, ${c}) and try the next column. This step back is the "back" in backtracking.`,
        [["row", r], ["col", c]],
      );
    }
    return false;
  }

  place(0);
  if (!found) {
    snap({}, `No arrangement works for n = ${n}.`);
  }
  return steps;
}

/* ── Subsets: every choice is "take it or leave it" ───────────────────── */

export function subsetsSteps(values: number[]): SubsetStep[] {
  const a = values.slice(0, 4);
  const steps: SubsetStep[] = [];
  const marks: ("in" | "out" | "pending")[] = a.map(() => "pending");
  const results: string[] = [];
  const fmt = () =>
    `{${a.filter((_, i) => marks[i] === "in").join(", ")}}`;

  const snap = (depth: number, note: string) =>
    steps.push({
      values: [...a],
      marks: [...marks],
      depth,
      results: [...results],
      note,
    });

  snap(
    0,
    `List every subset of {${a.join(", ")}}. Walk the numbers left to right; for each one make a yes/no decision: take it, or leave it. ${a.length} decisions → 2^${a.length} = ${2 ** a.length} subsets.`,
  );

  function walk(d: number) {
    if (d === a.length) {
      results.push(fmt());
      snap(-1, `No more decisions to make — record what we're holding: ${fmt()}.`);
      return;
    }
    marks[d] = "in";
    snap(d, `Decision ${d + 1}: say YES to ${a[d]} — it joins the basket. Now decide the rest.`);
    walk(d + 1);
    marks[d] = "out";
    snap(d, `Back at decision ${d + 1}. UNDO the yes, and explore the other branch: say NO to ${a[d]}.`);
    walk(d + 1);
    marks[d] = "pending";
  }

  walk(0);
  snap(
    -1,
    `Done — ${results.length} subsets, each visited exactly once. Same skeleton solves permutations, combinations and word search: choose → explore → un-choose.`,
  );
  return steps;
}
