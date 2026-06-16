import type { AttentionStep } from "./types";

/**
 * A tiny hand-tuned example so the attention pattern is interpretable: the
 * pronoun "it" (and the verb "crossed") should attend to the noun "animal".
 * Each token carries a 2-D query/key/value vector.
 */
type Tok = { text: string; q: number[]; k: number[]; v: number[] };

const TOKENS: Tok[] = [
  { text: "the", q: [0.1, 0.1], k: [0.1, 0.1], v: [0.0, 0.0] },
  { text: "animal", q: [0.2, 0.3], k: [1.0, 0.2], v: [1.0, 0.0] },
  { text: "crossed", q: [0.9, 0.1], k: [0.2, 1.0], v: [0.0, 1.0] },
  { text: "it", q: [1.0, 0.2], k: [0.3, 0.3], v: [0.5, 0.5] },
];

export const ATTN_TOKENS = TOKENS.map((t) => t.text);

const D = 2;
const SCALE = 1 / Math.sqrt(D);
const dot = (a: number[], b: number[]) => a.reduce((s, x, i) => s + x * b[i], 0);

function softmax(xs: number[]): number[] {
  const m = Math.max(...xs);
  const exps = xs.map((x) => Math.exp(x - m));
  const sum = exps.reduce((s, e) => s + e, 0);
  return exps.map((e) => e / sum);
}

/**
 * Steps one self-attention computation for a chosen query token: raw scaled
 * dot-product scores → softmax weights → weighted sum of values.
 * Pure: (queryIndex) => AttentionStep[].
 */
export function attentionSteps(query: number): AttentionStep[] {
  const tokens = ATTN_TOKENS;
  const qVec = TOKENS[query].q;
  const scores = TOKENS.map((t) => dot(qVec, t.k) * SCALE);
  const weights = softmax(scores);
  const dominant = weights.indexOf(Math.max(...weights));
  const pct = (w: number) => `${Math.round(w * 100)}%`;

  return [
    {
      tokens,
      query,
      phase: "start",
      note: `Self-attention lets every token look at every other token in one step. We'll compute what "${tokens[query]}" attends to. Each token carries a query (Q), key (K) and value (V) vector.`,
      vars: [
        ["query", `"${tokens[query]}"`],
        ["dim d", D],
      ],
    },
    {
      tokens,
      query,
      phase: "scores",
      scores,
      note: `Score every token against the query: score = Q("${tokens[query]}") · K / √d. A higher score means "more relevant to me". The √d scaling keeps scores from exploding as dimension grows.`,
      vars: [["top score", `"${tokens[dominant]}" = ${scores[dominant].toFixed(2)}`]],
    },
    {
      tokens,
      query,
      phase: "softmax",
      weights,
      dominant,
      note: `Softmax turns the scores into attention weights that sum to 1. "${tokens[query]}" puts ${pct(weights[dominant])} of its attention on "${tokens[dominant]}".`,
      vars: [
        ["Σ weights", "1.00"],
        [`on "${tokens[dominant]}"`, pct(weights[dominant])],
      ],
    },
    {
      tokens,
      query,
      phase: "output",
      weights,
      dominant,
      note: `The new representation of "${tokens[query]}" is the weighted sum of every token's Value vector — so it now carries mostly "${tokens[dominant]}"'s meaning. That is how a pronoun quietly resolves to its noun.`,
      vars: [["output ≈", `mostly V("${tokens[dominant]}")`]],
    },
  ];
}
