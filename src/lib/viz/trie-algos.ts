import type { Tone, TrieNodeP, TrieStep } from "./types";

/**
 * Trie, jargon-free: a family tree of letters. Words that start the same
 * way share the same starting branch, so "car", "cat" and "card" store
 * c→a→r only once. Looking anything up costs one step per letter —
 * the number of stored words doesn't matter at all.
 */
export function trieSteps(words: string[], query: string): TrieStep[] {
  const ws = words
    .map((w) => w.toLowerCase().replace(/[^a-z]/g, "").slice(0, 6))
    .filter(Boolean)
    .slice(0, 6);
  const q = query.toLowerCase().replace(/[^a-z]/g, "").slice(0, 8);

  const nodes: TrieNodeP[] = [{ id: 0, ch: "", parent: null, word: false }];
  const children = new Map<number, Map<string, number>>([[0, new Map()]]);
  const steps: TrieStep[] = [];
  const snap = (tones: Record<number, Tone>, note: string, vars?: TrieStep["vars"]) =>
    steps.push({ nodes: nodes.map((n) => ({ ...n })), tones, note, vars });

  snap({ 0: "focus" }, `An empty trie — just a root with no letters. We'll insert: ${ws.map((w) => `"${w}"`).join(", ")}.`);

  for (const w of ws) {
    let cur = 0;
    for (let i = 0; i < w.length; i++) {
      const ch = w[i];
      const kids = children.get(cur)!;
      if (kids.has(ch)) {
        cur = kids.get(ch)!;
        snap(
          { [cur]: "focus" },
          `"${w}": a branch for '${ch}' already exists (shared with an earlier word) — just walk down it. Nothing new stored.`,
          [["inserting", w], ["letter", ch]],
        );
      } else {
        const id = nodes.length;
        nodes.push({ id, ch, parent: cur, word: false });
        children.set(id, new Map());
        kids.set(ch, id);
        cur = id;
        snap(
          { [cur]: "active" },
          `"${w}": no branch for '${ch}' here yet — grow one. Each letter is stored at most once per branching point.`,
          [["inserting", w], ["letter", ch]],
        );
      }
    }
    nodes[cur].word = true;
    snap(
      { [cur]: "good" },
      `Mark this node: a whole word ("${w}") ends here. Without the mark we couldn't tell "car" apart from "car" being merely the start of "card".`,
    );
  }

  // Lookup
  snap({}, `Now look up "${q}". Follow one branch per letter — at most ${q.length} steps, no matter how many words are stored.`);
  let cur = 0;
  let ok = true;
  for (let i = 0; i < q.length; i++) {
    const ch = q[i];
    const kids = children.get(cur)!;
    if (!kids.has(ch)) {
      snap(
        { [cur]: "bad" },
        `No '${ch}' branch below this point — nothing stored starts with "${q.slice(0, i + 1)}". Lookup over after ${i + 1} step${i === 0 ? "" : "s"}.`,
        [["query", q]],
      );
      ok = false;
      break;
    }
    cur = kids.get(ch)!;
    snap({ [cur]: "focus" }, `'${ch}' → follow the branch.`, [["query", q]]);
  }
  if (ok) {
    const isWord = nodes[cur].word;
    snap(
      { [cur]: isWord ? "good" : "accent" },
      isWord
        ? `Landed on a word-mark: "${q}" is stored. ${q.length} steps total — this is why autocomplete is instant.`
        : `Path exists but no word-mark: "${q}" is a *prefix* of stored words, not a stored word itself. Everything below this node autocompletes "${q}…".`,
      [["query", q], ["is word", isWord ? "yes" : "no"]],
    );
  }
  return steps;
}
