import type { MatchStep, Tone } from "./types";

/**
 * Substring search: find where `pattern` occurs inside `text`.
 * Naive: slide the pattern one step at a time, re-comparing from scratch.
 * KMP: precompute, for each pattern position, how much of the pattern
 * still matches after a mismatch — so the text pointer NEVER goes backwards.
 */

function clean(s: string, max: number): string {
  return s.replace(/\s/g, "").toUpperCase().slice(0, max);
}

/* ── Naive sliding ────────────────────────────────────────────────────── */

export function naiveSearchSteps(textIn: string, patIn: string): MatchStep[] {
  const text = clean(textIn, 16) || "ABABABCABABABD";
  const pat = clean(patIn, 8) || "ABABD";
  const n = text.length;
  const m = pat.length;
  const steps: MatchStep[] = [];
  let comparisons = 0;

  steps.push({
    text,
    pattern: pat,
    offset: 0,
    note: `Find "${pat}" inside "${text}", the obvious way: line the pattern up at every position and compare letter by letter.`,
  });

  for (let off = 0; off + m <= n; off++) {
    let k = 0;
    while (k < m && text[off + k] === pat[k]) {
      comparisons++;
      steps.push({
        text,
        pattern: pat,
        offset: off,
        textTones: Object.fromEntries(
          Array.from({ length: k + 1 }, (_, x) => [off + x, "good"]),
        ) as Record<number, Tone>,
        patTones: Object.fromEntries(
          Array.from({ length: k + 1 }, (_, x) => [x, "good"]),
        ) as Record<number, Tone>,
        note: `'${pat[k]}' matches. ${k + 1}/${m} letters confirmed at position ${off}.`,
        vars: [["shift", off], ["comparisons", comparisons]],
      });
      k++;
    }
    if (k === m) {
      steps.push({
        text,
        pattern: pat,
        offset: off,
        textTones: Object.fromEntries(
          Array.from({ length: m }, (_, x) => [off + x, "good"]),
        ) as Record<number, Tone>,
        note: `Full match at index ${off}, after ${comparisons} letter-comparisons. Fine here — but on repetitive text (like DNA or logs) this re-checking blows up to O(n·m).`,
        vars: [["found at", off], ["comparisons", comparisons]],
      });
      return steps;
    }
    comparisons++;
    steps.push({
      text,
      pattern: pat,
      offset: off,
      textTones: { [off + k]: "bad" },
      patTones: { [k]: "bad" },
      note: `Mismatch at pattern position ${k} ('${text[off + k]}' ≠ '${pat[k]}'). Naive recovery: forget everything, slide one step right, start comparing from scratch — even the ${k} letters we just confirmed.`,
      vars: [["shift", off], ["comparisons", comparisons]],
    });
  }

  steps.push({
    text,
    pattern: pat,
    offset: Math.max(0, n - m),
    note: `No match anywhere, after ${comparisons} comparisons.`,
    vars: [["comparisons", comparisons]],
  });
  return steps;
}

/* ── KMP ──────────────────────────────────────────────────────────────── */

export function kmpSteps(textIn: string, patIn: string): MatchStep[] {
  const text = clean(textIn, 16) || "ABABABCABABABD";
  const pat = clean(patIn, 8) || "ABABD";
  const n = text.length;
  const m = pat.length;
  const steps: MatchStep[] = [];

  /* Phase 1: build the failure table (lps). lps[i] answers: if we mismatch
     just after position i, how many pattern letters are STILL known to match
     (because the pattern's start repeats inside itself)? */
  const lps: number[] = Array(m).fill(0);
  const shown: (number | null)[] = Array(m).fill(null);
  shown[0] = 0;
  steps.push({
    text,
    pattern: pat,
    offset: 0,
    lps: [...shown],
    note: `KMP prep — study the pattern alone. For each position, write down: "if I fail here, how much of the pattern's own beginning is still alive in what I matched?" (Computers hate redoing work; this table is the cure.)`,
  });
  let len = 0;
  for (let i = 1; i < m; i++) {
    while (len > 0 && pat[i] !== pat[len]) len = lps[len - 1];
    if (pat[i] === pat[len]) len++;
    lps[i] = len;
    shown[i] = len;
    steps.push({
      text,
      pattern: pat,
      offset: 0,
      patTones: { [i]: "active", ...(len > 0 ? { [len - 1]: "focus" } : {}) },
      lps: [...shown],
      note:
        len > 0
          ? `Up to '${pat[i]}' the pattern ends with its own first ${len} letter${len === 1 ? "" : "s"} ("${pat.slice(0, len)}") — so after a mismatch here, ${len} letters survive.`
          : `Up to '${pat[i]}' nothing at the end repeats the beginning — a mismatch here means starting over.`,
      vars: [["position", i], ["survives", len]],
    });
  }

  /* Phase 2: scan the text. */
  steps.push({
    text,
    pattern: pat,
    offset: 0,
    lps,
    note: "Now scan. The rule that makes KMP fast: the text pointer only moves forward. On mismatch, the PATTERN jumps (using the table) — the text never rewinds.",
  });
  let q = 0;
  let comparisons = 0;
  for (let i = 0; i < n; i++) {
    while (q > 0 && text[i] !== pat[q]) {
      const jump = lps[q - 1];
      comparisons++;
      steps.push({
        text,
        pattern: pat,
        offset: i - jump,
        textTones: { [i]: "bad" },
        lps,
        note: `'${text[i]}' ≠ '${pat[q]}'. Table says: of the ${q} matched letters, the first ${jump} double as a fresh start — slide the pattern so those line up and keep going. No text rewind.`,
        vars: [["text index", i], ["kept", jump], ["comparisons", comparisons]],
      });
      q = jump;
    }
    comparisons++;
    const hit = text[i] === pat[q];
    if (hit) q++;
    steps.push({
      text,
      pattern: pat,
      // pattern[0..q-1] is aligned under text[i-q+1..i]; with nothing
      // matched, show the pattern waiting at the next position.
      offset: q > 0 ? i - q + 1 : Math.min(i + 1, Math.max(0, n - m)),
      textTones: { [i]: hit ? "good" : "bad" },
      patTones: hit
        ? (Object.fromEntries(
            Array.from({ length: q }, (_, x) => [x, "good"]),
          ) as Record<number, Tone>)
        : {},
      lps,
      note: hit
        ? `'${text[i]}' matches — ${q}/${m} confirmed.`
        : `'${text[i]}' doesn't start the pattern — move on.`,
      vars: [["text index", i], ["matched", q], ["comparisons", comparisons]],
    });
    if (q === m) {
      const at = i - m + 1;
      steps.push({
        text,
        pattern: pat,
        offset: at,
        textTones: Object.fromEntries(
          Array.from({ length: m }, (_, x) => [at + x, "good"]),
        ) as Record<number, Tone>,
        lps,
        note: `Full match at index ${at} — ${comparisons} comparisons, and the text pointer never once moved backwards. That's O(n + m), guaranteed, even on the nastiest repetitive input.`,
        vars: [["found at", at], ["comparisons", comparisons]],
      });
      return steps;
    }
  }

  steps.push({
    text,
    pattern: pat,
    offset: Math.max(0, n - m),
    lps,
    note: `No match — ${comparisons} comparisons in one forward pass. O(n + m).`,
    vars: [["comparisons", comparisons]],
  });
  return steps;
}
