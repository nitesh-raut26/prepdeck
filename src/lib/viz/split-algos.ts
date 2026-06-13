import type { SplitStep, Tone } from "./types";

/**
 * Splitwise "simplify debts": only each person's *net* balance matters, so the
 * minimal settlement repeatedly pays the biggest debtor's debt to the biggest
 * creditor. Pure generator: (debts) => SplitStep[]. This is the greedy idea from
 * the DSA module wearing an LLD costume.
 */
export type Debt = { from: string; to: string; amount: number };

const DEBT_RE = /([A-Za-z]\w*)\s*(?:->|owes)\s*([A-Za-z]\w*)\s*:?\s*(\d+)/gi;
const MAX_DEBTS = 12;

export function parseDebts(raw: string): {
  debts: Debt[] | null;
  error: string | null;
} {
  const debts: Debt[] = [];
  let m: RegExpExecArray | null;
  DEBT_RE.lastIndex = 0;
  while ((m = DEBT_RE.exec(raw))) {
    if (m[1] === m[2]) continue; // self-debt is a no-op
    debts.push({ from: m[1], to: m[2], amount: Number(m[3]) });
  }
  if (debts.length === 0) {
    return { debts: null, error: "Try: A->B:10, B->C:20, C->A:5" };
  }
  if (debts.length > MAX_DEBTS) {
    return { debts: null, error: `Keep it to ≤ ${MAX_DEBTS} debts` };
  }
  return { debts, error: null };
}

export function splitwiseSteps(debts: Debt[]): SplitStep[] {
  const balance = new Map<string, number>();
  const order: string[] = [];
  const touch = (id: string) => {
    if (!balance.has(id)) {
      balance.set(id, 0);
      order.push(id);
    }
  };
  for (const d of debts) {
    touch(d.from);
    touch(d.to);
    balance.set(d.from, balance.get(d.from)! - d.amount);
    balance.set(d.to, balance.get(d.to)! + d.amount);
  }

  const settlements: { from: string; to: string; amount: number }[] = [];
  const steps: SplitStep[] = [];
  const rawCount = debts.length;

  const snap = (s: {
    note: string;
    tones?: Record<string, Tone>;
    vars?: [string, string | number][];
  }) => {
    const tones = s.tones ?? {};
    steps.push({
      people: order.map((id) => ({
        id,
        balance: balance.get(id)!,
        tone: tones[id],
      })),
      settlements: settlements.map((x) => ({ ...x })),
      rawCount,
      note: s.note,
      vars: s.vars,
    });
  };

  snap({
    note: `${rawCount} separate IOUs between ${order.length} people. First collapse them: a person's net balance is what they're owed minus what they owe. Who paid whom stops mattering — only the net does.`,
    vars: [["raw debts", rawCount]],
  });

  // Greedy: settle the biggest debtor against the biggest creditor.
  const EPS = 1e-9;
  let guard = 0;
  while (guard++ < 100) {
    let creditor: string | null = null;
    let debtor: string | null = null;
    let maxC = EPS;
    let minD = -EPS;
    for (const id of order) {
      const b = balance.get(id)!;
      if (b > maxC) {
        maxC = b;
        creditor = id;
      }
      if (b < minD) {
        minD = b;
        debtor = id;
      }
    }
    if (!creditor || !debtor) break;

    const amount = Math.min(balance.get(creditor)!, -balance.get(debtor)!);
    snap({
      tones: { [creditor]: "good", [debtor]: "bad" },
      note: `Biggest creditor is ${creditor} (+${balance.get(creditor)}), biggest debtor is ${debtor} (${balance.get(debtor)}). ${debtor} pays ${creditor} ${amount} — that zeroes out whoever is smaller, so at least one person is done in a single transfer.`,
      vars: [["transfer", `${debtor} → ${creditor}`], ["amount", amount]],
    });
    balance.set(creditor, balance.get(creditor)! - amount);
    balance.set(debtor, balance.get(debtor)! + amount);
    settlements.push({ from: debtor, to: creditor, amount });
    snap({
      tones: {
        [creditor]: balance.get(creditor)! > EPS ? "good" : "muted",
        [debtor]: balance.get(debtor)! < -EPS ? "bad" : "muted",
      },
      note: `Recorded ${debtor} → ${creditor}: ${amount}. Balances updated; anyone at 0 is settled and drops out.`,
      vars: [["settlements", settlements.length]],
    });
  }

  snap({
    note: `Everyone is at 0. Settled in ${settlements.length} transfer${settlements.length === 1 ? "" : "s"} instead of ${rawCount} — the minimum is at most (people − 1).`,
    vars: [["was", rawCount], ["now", settlements.length]],
  });
  return steps;
}
