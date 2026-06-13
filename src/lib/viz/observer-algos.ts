import type { ObserverStep, Tone } from "./types";

/**
 * Observer / publish-subscribe, stepped one delivery at a time. The generator
 * is pure: (ops) => ObserverStep[]. A publish fans out to every *currently*
 * subscribed observer — the point of the pattern is that the subject never
 * needs to know who is listening or how many.
 */
export type ObserverOp =
  | { type: "sub"; who: string }
  | { type: "unsub"; who: string }
  | { type: "pub"; value: string };

const OP_RE = /(sub|subscribe|unsub|unsubscribe|pub|publish)\s+([A-Za-z0-9_-]+)/gi;
const MAX_OPS = 12;
const MAX_OBSERVERS = 5;

export function parseObserverOps(raw: string): {
  ops: ObserverOp[] | null;
  error: string | null;
} {
  const ops: ObserverOp[] = [];
  let m: RegExpExecArray | null;
  OP_RE.lastIndex = 0;
  while ((m = OP_RE.exec(raw))) {
    const verb = m[1].toLowerCase();
    if (verb.startsWith("unsub")) ops.push({ type: "unsub", who: m[2] });
    else if (verb.startsWith("sub")) ops.push({ type: "sub", who: m[2] });
    else ops.push({ type: "pub", value: m[2] });
  }
  if (ops.length === 0) {
    return { ops: null, error: "Try: sub Chart, sub Alerts, pub 42, unsub Chart, pub 9" };
  }
  if (ops.length > MAX_OPS) {
    return { ops: null, error: `Keep it to ≤ ${MAX_OPS} ops` };
  }
  const pool = new Set<string>();
  for (const op of ops) if (op.type !== "pub") pool.add(op.who);
  if (pool.size > MAX_OBSERVERS) {
    return { ops: null, error: `Keep it to ≤ ${MAX_OBSERVERS} observers` };
  }
  return { ops, error: null };
}

export function observerSteps(ops: ObserverOp[]): ObserverStep[] {
  // Observer pool = every name that appears in a sub/unsub, first-seen order.
  const pool: string[] = [];
  for (const op of ops)
    if (op.type !== "pub" && !pool.includes(op.who)) pool.push(op.who);

  const subscribed = new Set<string>();
  const steps: ObserverStep[] = [];

  const snap = (s: {
    note: string;
    op?: string;
    subjectValue?: string | number | null;
    delivering?: string | null;
    publishing?: boolean;
    log?: string[];
    tones?: Record<string, Tone>;
    vars?: [string, string | number][];
  }) => {
    const tones = s.tones ?? {};
    steps.push({
      subjectValue: s.subjectValue ?? lastValue,
      observers: pool.map((id) => ({
        id,
        subscribed: subscribed.has(id),
        tone: tones[id],
      })),
      delivering: s.delivering ?? null,
      publishing: s.publishing ?? false,
      op: s.op,
      log: s.log ?? [],
      note: s.note,
      vars: s.vars,
    });
  };

  let lastValue: string | number | null = null;

  snap({
    note: `A subject and ${pool.length} possible observers. The subject holds a list of subscribers and knows nothing else about them — that decoupling is the whole pattern.`,
    vars: [["subscribers", 0]],
  });

  for (const op of ops) {
    if (op.type === "sub") {
      subscribed.add(op.who);
      snap({
        op: `subscribe(${op.who})`,
        tones: { [op.who]: "good" },
        note: `${op.who} subscribes — the subject adds it to its list. No code in the subject changes to support a new observer type.`,
        vars: [["subscribers", subscribed.size]],
      });
    } else if (op.type === "unsub") {
      subscribed.delete(op.who);
      snap({
        op: `unsubscribe(${op.who})`,
        tones: { [op.who]: "bad" },
        note: `${op.who} unsubscribes — removed from the list, and it simply stops getting updates. Remember this in real code: a forgotten unsubscribe is the classic memory leak.`,
        vars: [["subscribers", subscribed.size]],
      });
    } else {
      lastValue = op.value;
      const targets = pool.filter((id) => subscribed.has(id));
      snap({
        op: `publish(${op.value})`,
        subjectValue: op.value,
        publishing: true,
        note:
          targets.length === 0
            ? `publish(${op.value}): no one is subscribed, so nothing happens — and the subject is none the wiser.`
            : `publish(${op.value}): the subject loops its subscriber list and notifies each one. It never knew their concrete types.`,
        vars: [["value", op.value], ["subscribers", targets.length]],
      });
      const delivered: string[] = [];
      for (const id of targets) {
        delivered.push(id);
        snap({
          op: `publish(${op.value})`,
          subjectValue: op.value,
          publishing: true,
          delivering: id,
          log: [...delivered],
          tones: Object.fromEntries(delivered.map((d) => [d, "good" as Tone])),
          note: `→ ${id}.update(${op.value}) runs. Each observer reacts in its own way — the subject just calls the same method on all of them.`,
          vars: [["delivered", `${delivered.length}/${targets.length}`]],
        });
      }
    }
  }
  return steps;
}
