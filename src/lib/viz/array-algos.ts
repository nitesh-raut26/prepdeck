import type { ArrayStep, Tone } from "./types";

/* Helpers ─────────────────────────────────────────────────────────────── */

function tonesFor(
  entries: [number, Tone][],
  base?: Record<number, Tone>,
): Record<number, Tone> {
  const t: Record<number, Tone> = { ...base };
  for (const [i, tone] of entries) t[i] = tone;
  return t;
}

/* ── Binary search ────────────────────────────────────────────────────── */

export function binarySearchSteps(values: number[], target: number): ArrayStep[] {
  const a = [...values].sort((x, y) => x - y);
  const steps: ArrayStep[] = [];
  let lo = 0;
  let hi = a.length - 1;

  steps.push({
    values: a,
    pointers: [
      { label: "lo", index: lo, tone: "focus" },
      { label: "hi", index: hi, tone: "focus" },
    ],
    note: `Search space is the whole array. Looking for ${target}.`,
    vars: [["lo", lo], ["hi", hi], ["target", target]],
  });

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const muted: [number, Tone][] = [];
    for (let i = 0; i < a.length; i++) {
      if (i < lo || i > hi) muted.push([i, "muted"]);
    }

    steps.push({
      values: a,
      tones: tonesFor([...muted, [mid, "active"]]),
      pointers: [
        { label: "lo", index: lo, tone: "focus" },
        { label: "mid", index: mid, tone: "active" },
        { label: "hi", index: hi, tone: "focus" },
      ],
      note: `mid = ⌊(${lo} + ${hi}) / 2⌋ = ${mid}. Compare a[mid] = ${a[mid]} with ${target}.`,
      vars: [["lo", lo], ["mid", mid], ["hi", hi], ["a[mid]", a[mid]]],
    });

    if (a[mid] === target) {
      steps.push({
        values: a,
        tones: tonesFor([...muted, [mid, "good"]]),
        pointers: [{ label: "found", index: mid, tone: "good" }],
        note: `a[${mid}] = ${target} — found it in ${steps.length} comparisons. O(log n) beats scanning all ${a.length}.`,
        vars: [["answer", mid]],
      });
      return steps;
    }

    if (a[mid] < target) {
      lo = mid + 1;
      steps.push({
        values: a,
        tones: tonesFor(
          a.map((_, i) => [i, i < lo || i > hi ? "muted" : "idle"] as [number, Tone]),
        ),
        pointers:
          lo <= hi
            ? [
                { label: "lo", index: lo, tone: "focus" },
                { label: "hi", index: hi, tone: "focus" },
              ]
            : [],
        note: `${a[mid]} < ${target}, so the answer can only be right of mid. Discard the left half: lo = ${lo}.`,
        vars: [["lo", lo], ["hi", hi]],
      });
    } else {
      hi = mid - 1;
      steps.push({
        values: a,
        tones: tonesFor(
          a.map((_, i) => [i, i < lo || i > hi ? "muted" : "idle"] as [number, Tone]),
        ),
        pointers:
          lo <= hi
            ? [
                { label: "lo", index: lo, tone: "focus" },
                { label: "hi", index: hi, tone: "focus" },
              ]
            : [],
        note: `${a[mid]} > ${target}, so the answer can only be left of mid. Discard the right half: hi = ${hi}.`,
        vars: [["lo", lo], ["hi", hi]],
      });
    }
  }

  steps.push({
    values: a,
    tones: tonesFor(a.map((_, i) => [i, "muted"] as [number, Tone])),
    note: `lo (${lo}) crossed hi (${hi}) — the search space is empty. ${target} is not in the array.`,
    vars: [["answer", -1]],
  });
  return steps;
}

/* ── Sorting ──────────────────────────────────────────────────────────── */

export type SortKind = "bubble" | "selection" | "insertion" | "quick" | "merge";

export function sortSteps(values: number[], kind: SortKind): ArrayStep[] {
  switch (kind) {
    case "bubble":
      return bubbleSortSteps(values);
    case "selection":
      return selectionSortSteps(values);
    case "insertion":
      return insertionSortSteps(values);
    case "quick":
      return quickSortSteps(values);
    case "merge":
      return mergeSortSteps(values);
  }
}

function doneStep(a: number[], note: string): ArrayStep {
  return {
    values: [...a],
    tones: tonesFor(a.map((_, i) => [i, "good"] as [number, Tone])),
    note,
  };
}

function bubbleSortSteps(values: number[]): ArrayStep[] {
  const a = [...values];
  const n = a.length;
  const steps: ArrayStep[] = [
    { values: [...a], note: "Bubble sort: repeatedly swap adjacent out-of-order pairs; the largest value bubbles to the end each pass." },
  ];
  const sorted = (from: number): [number, Tone][] =>
    a.map((_, i) => [i, i >= from ? "good" : "idle"] as [number, Tone]).filter(([i]) => (i as number) >= from);

  for (let end = n - 1; end > 0; end--) {
    let swapped = false;
    for (let j = 0; j < end; j++) {
      steps.push({
        values: [...a],
        tones: tonesFor([[j, "active"], [j + 1, "active"]], tonesFor(sorted(end + 1))),
        note: `Compare a[${j}] = ${a[j]} and a[${j + 1}] = ${a[j + 1]}.`,
        vars: [["pass ends at", end]],
      });
      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swapped = true;
        steps.push({
          values: [...a],
          tones: tonesFor([[j, "accent"], [j + 1, "accent"]], tonesFor(sorted(end + 1))),
          note: `${a[j + 1]} > ${a[j]} — swap them.`,
        });
      }
    }
    steps.push({
      values: [...a],
      tones: tonesFor(sorted(end)),
      note: `Pass done: a[${end}] = ${a[end]} is in its final place.`,
    });
    if (!swapped) {
      steps.push(doneStep(a, "No swaps in a full pass — the array is already sorted. Early exit (best case O(n))."));
      return steps;
    }
  }
  steps.push(doneStep(a, "Sorted. Worst case O(n²) comparisons — fine to reason with, too slow for big inputs."));
  return steps;
}

function selectionSortSteps(values: number[]): ArrayStep[] {
  const a = [...values];
  const n = a.length;
  const steps: ArrayStep[] = [
    { values: [...a], note: "Selection sort: find the minimum of the unsorted part, swap it to the front." },
  ];
  for (let i = 0; i < n - 1; i++) {
    let min = i;
    const sortedTones = (): [number, Tone][] =>
      Array.from({ length: i }, (_, k) => [k, "good"] as [number, Tone]);
    for (let j = i + 1; j < n; j++) {
      steps.push({
        values: [...a],
        tones: tonesFor([[min, "focus"], [j, "active"]], tonesFor(sortedTones())),
        pointers: [{ label: "min", index: min, tone: "focus" }],
        note: `Is a[${j}] = ${a[j]} smaller than the current minimum ${a[min]}?`,
      });
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) {
      [a[i], a[min]] = [a[min], a[i]];
      steps.push({
        values: [...a],
        tones: tonesFor([[i, "accent"], [min, "accent"]], tonesFor(sortedTones())),
        note: `Swap minimum ${a[i]} into position ${i}.`,
      });
    }
    steps.push({
      values: [...a],
      tones: tonesFor(Array.from({ length: i + 1 }, (_, k) => [k, "good"] as [number, Tone])),
      note: `Positions 0…${i} are sorted.`,
    });
  }
  steps.push(doneStep(a, "Sorted. Always O(n²) comparisons but only O(n) swaps — useful when writes are expensive."));
  return steps;
}

function insertionSortSteps(values: number[]): ArrayStep[] {
  const a = [...values];
  const steps: ArrayStep[] = [
    { values: [...a], note: "Insertion sort: grow a sorted prefix; insert each new element into its place, like sorting cards in hand." },
  ];
  for (let i = 1; i < a.length; i++) {
    const key = a[i];
    steps.push({
      values: [...a],
      tones: tonesFor([[i, "active"]], tonesFor(Array.from({ length: i }, (_, k) => [k, "good"] as [number, Tone]))),
      note: `Take a[${i}] = ${key}; slide it left past anything bigger.`,
      vars: [["key", key]],
    });
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      a[j + 1] = a[j];
      steps.push({
        values: [...a],
        tones: tonesFor([[j + 1, "accent"], [j, "focus"]]),
        note: `${a[j + 1]} > ${key}: shift it right.`,
        vars: [["key", key]],
      });
      j--;
    }
    a[j + 1] = key;
    steps.push({
      values: [...a],
      tones: tonesFor([[j + 1, "good"]]),
      note: `Insert ${key} at index ${j + 1}.`,
    });
  }
  steps.push(doneStep(a, "Sorted. O(n²) worst case but O(n) on nearly-sorted data — why TimSort uses it for small runs."));
  return steps;
}

function quickSortSteps(values: number[]): ArrayStep[] {
  const a = [...values];
  const steps: ArrayStep[] = [
    { values: [...a], note: "Quick sort (Lomuto): pick the last element as pivot, partition smaller values to its left, recurse on both sides." },
  ];
  const final = new Set<number>();
  const finalTones = (): [number, Tone][] =>
    [...final].map((i) => [i, "good"] as [number, Tone]);

  function partition(lo: number, hi: number): number {
    const pivot = a[hi];
    steps.push({
      values: [...a],
      tones: tonesFor([[hi, "accent"]], tonesFor(finalTones())),
      spans: [{ from: lo, to: hi, tone: "focus" }],
      note: `Partition [${lo}…${hi}] around pivot ${pivot}.`,
      vars: [["pivot", pivot]],
    });
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      steps.push({
        values: [...a],
        tones: tonesFor([[hi, "accent"], [j, "active"]], tonesFor(finalTones())),
        pointers: [
          ...(i >= lo ? [{ label: "i", index: i, tone: "focus" as const }] : []),
          { label: "j", index: j, tone: "active" },
        ],
        note: `a[${j}] = ${a[j]} ${a[j] < pivot ? `< ${pivot} — belongs left of the pivot` : `≥ ${pivot} — stays right`}.`,
      });
      if (a[j] < pivot) {
        i++;
        if (i !== j) {
          [a[i], a[j]] = [a[j], a[i]];
          steps.push({
            values: [...a],
            tones: tonesFor([[i, "accent"], [j, "accent"], [hi, "accent"]], tonesFor(finalTones())),
            note: `Swap a[${i}] and a[${j}] to grow the “smaller than pivot” region.`,
          });
        }
      }
    }
    [a[i + 1], a[hi]] = [a[hi], a[i + 1]];
    final.add(i + 1);
    steps.push({
      values: [...a],
      tones: tonesFor(finalTones()),
      note: `Place pivot ${a[i + 1]} at index ${i + 1} — its final sorted position.`,
    });
    return i + 1;
  }

  function sort(lo: number, hi: number) {
    if (lo > hi) return;
    if (lo === hi) {
      final.add(lo);
      steps.push({
        values: [...a],
        tones: tonesFor(finalTones()),
        note: `Single element a[${lo}] = ${a[lo]} is trivially sorted.`,
      });
      return;
    }
    const p = partition(lo, hi);
    sort(lo, p - 1);
    sort(p + 1, hi);
  }

  sort(0, a.length - 1);
  steps.push(doneStep(a, "Sorted. Average O(n log n); worst case O(n²) on adversarial pivots — randomise the pivot in practice."));
  return steps;
}

function mergeSortSteps(values: number[]): ArrayStep[] {
  const a = [...values];
  const steps: ArrayStep[] = [
    { values: [...a], note: "Merge sort: split in half, sort each half, then merge two sorted halves in linear time." },
  ];

  function merge(lo: number, mid: number, hi: number) {
    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    steps.push({
      values: [...a],
      spans: [
        { from: lo, to: mid, tone: "focus" },
        { from: mid + 1, to: hi, tone: "accent" },
      ],
      note: `Merge sorted halves [${left.join(", ")}] and [${right.join(", ")}].`,
    });
    let i = 0;
    let j = 0;
    for (let k = lo; k <= hi; k++) {
      const takeLeft = j >= right.length || (i < left.length && left[i] <= right[j]);
      a[k] = takeLeft ? left[i++] : right[j++];
      steps.push({
        values: [...a],
        tones: tonesFor([[k, "active"]]),
        spans: [{ from: lo, to: hi, tone: "focus" }],
        note: `Smallest remaining is ${a[k]} (from the ${takeLeft ? "left" : "right"} half) — write it at index ${k}.`,
      });
    }
    steps.push({
      values: [...a],
      spans: [{ from: lo, to: hi, tone: "good" }],
      note: `[${lo}…${hi}] is now a single sorted run.`,
    });
  }

  function sort(lo: number, hi: number) {
    if (lo >= hi) return;
    const mid = lo + Math.floor((hi - lo) / 2);
    sort(lo, mid);
    sort(mid + 1, hi);
    merge(lo, mid, hi);
  }

  sort(0, a.length - 1);
  steps.push(doneStep(a, "Sorted. Guaranteed O(n log n), stable — at the cost of O(n) extra memory for the merge buffers."));
  return steps;
}

/* ── Two pointers: pair with target sum (sorted array) ────────────────── */

export function twoPointersSteps(values: number[], target: number): ArrayStep[] {
  const a = [...values].sort((x, y) => x - y);
  const steps: ArrayStep[] = [];
  let i = 0;
  let j = a.length - 1;

  steps.push({
    values: a,
    pointers: [
      { label: "i", index: i, tone: "focus" },
      { label: "j", index: j, tone: "accent" },
    ],
    note: `Sorted array. Does any pair sum to ${target}? Start with the widest pair.`,
    vars: [["target", target]],
  });

  while (i < j) {
    const sum = a[i] + a[j];
    const base = tonesFor(
      a.map((_, k) => [k, k < i || k > j ? "muted" : "idle"] as [number, Tone]),
    );
    if (sum === target) {
      steps.push({
        values: a,
        tones: tonesFor([[i, "good"], [j, "good"]], base),
        pointers: [
          { label: "i", index: i, tone: "good" },
          { label: "j", index: j, tone: "good" },
        ],
        note: `${a[i]} + ${a[j]} = ${target} — pair found in O(n) without trying all O(n²) pairs.`,
        vars: [["sum", sum]],
      });
      return steps;
    }
    if (sum < target) {
      steps.push({
        values: a,
        tones: tonesFor([[i, "bad"], [j, "active"]], base),
        pointers: [
          { label: "i", index: i, tone: "focus" },
          { label: "j", index: j, tone: "accent" },
        ],
        note: `${a[i]} + ${a[j]} = ${sum} < ${target}. The sum is too small, and a[${i}] is the smallest candidate — move i right.`,
        vars: [["sum", sum]],
      });
      i++;
    } else {
      steps.push({
        values: a,
        tones: tonesFor([[i, "active"], [j, "bad"]], base),
        pointers: [
          { label: "i", index: i, tone: "focus" },
          { label: "j", index: j, tone: "accent" },
        ],
        note: `${a[i]} + ${a[j]} = ${sum} > ${target}. Too big, and a[${j}] is the largest candidate — move j left.`,
        vars: [["sum", sum]],
      });
      j--;
    }
  }

  steps.push({
    values: a,
    tones: tonesFor(a.map((_, k) => [k, "muted"] as [number, Tone])),
    note: `Pointers met — no pair sums to ${target}.`,
  });
  return steps;
}

/* ── Sliding window: max sum of k consecutive elements ────────────────── */

export function slidingWindowSteps(values: number[], k: number): ArrayStep[] {
  const a = [...values];
  const steps: ArrayStep[] = [];
  if (k < 1 || k > a.length) {
    return [{ values: a, note: `Window size k must be between 1 and ${a.length}.` }];
  }

  let sum = 0;
  for (let i = 0; i < k; i++) sum += a[i];
  let best = sum;
  let bestAt = 0;

  steps.push({
    values: a,
    spans: [{ from: 0, to: k - 1, tone: "accent" }],
    note: `Build the first window of size ${k} by adding its elements once: sum = ${sum}.`,
    vars: [["sum", sum], ["best", best]],
  });

  for (let i = k; i < a.length; i++) {
    sum += a[i] - a[i - k];
    steps.push({
      values: a,
      spans: [{ from: i - k + 1, to: i, tone: "accent" }],
      tones: tonesFor([[i, "active"], [i - k, "bad"]]),
      pointers: [
        { label: "+", index: i, tone: "good" },
        { label: "−", index: i - k, tone: "bad" },
      ],
      note: `Slide: add a[${i}] = ${a[i]}, drop a[${i - k}] = ${a[i - k]}. New sum = ${sum} — O(1) per move instead of re-adding ${k} numbers.`,
      vars: [["sum", sum], ["best", best]],
    });
    if (sum > best) {
      best = sum;
      bestAt = i - k + 1;
      steps.push({
        values: a,
        spans: [{ from: i - k + 1, to: i, tone: "good" }],
        note: `New best window: sum = ${best}.`,
        vars: [["sum", sum], ["best", best]],
      });
    }
  }

  steps.push({
    values: a,
    spans: [{ from: bestAt, to: bestAt + k - 1, tone: "good" }],
    note: `Done in one pass: the best window of size ${k} sums to ${best}. O(n) total.`,
    vars: [["best", best]],
  });
  return steps;
}
