import type { HashStep } from "./types";

/**
 * Hash table with chaining, jargon-free: a row of numbered drawers.
 * The "hash" is just a rule that turns a key into a drawer number
 * (here: key % drawerCount). Two keys landing in the same drawer is a
 * "collision" — we handle it by keeping a short list inside the drawer.
 */
export function hashTableSteps(
  keys: number[],
  m: number,
  lookup: number,
): HashStep[] {
  m = Math.max(3, Math.min(m, 10));
  const ks = keys.slice(0, 10);
  const buckets: number[][] = Array.from({ length: m }, () => []);
  const steps: HashStep[] = [];
  const snap = (s: Omit<HashStep, "buckets">) =>
    steps.push({ ...s, buckets: buckets.map((b) => [...b]) });

  snap({
    activeBucket: null,
    note: `${m} drawers, all empty. The rule: a key goes into drawer (key % ${m}) — the remainder after dividing by ${m}. Same key, same drawer, every time. That's all a hash function is.`,
  });

  for (const k of ks) {
    const b = k % m;
    snap({
      activeBucket: b,
      keyTones: { [k]: "active" },
      note: `Insert ${k}: ${k} % ${m} = ${b}, so it belongs in drawer ${b}. No searching — the key itself tells us where to go.`,
      vars: [["key", k], ["drawer", b]],
    });
    const collision = buckets[b].length > 0;
    buckets[b].push(k);
    snap({
      activeBucket: b,
      keyTones: { [k]: collision ? "accent" : "good" },
      note: collision
        ? `Drawer ${b} already holds ${buckets[b].slice(0, -1).join(", ")} — a collision. No problem: the drawer keeps a little chain, and ${k} joins the end. Too many long chains? Real tables grow the drawer count and re-place everything.`
        : `Drawer ${b} was free — ${k} stored. One step, no matter how many keys exist. That's the O(1) everyone talks about.`,
      vars: [["key", k], ["drawer", b]],
    });
  }

  const b = lookup % m;
  snap({
    activeBucket: b,
    note: `Find ${lookup}: same rule, ${lookup} % ${m} = ${b}. Jump straight to drawer ${b} — we never look at the other ${m - 1} drawers.`,
    vars: [["key", lookup], ["drawer", b]],
  });
  const chain = buckets[b];
  let found = false;
  for (let i = 0; i < chain.length; i++) {
    if (chain[i] === lookup) {
      found = true;
      snap({
        activeBucket: b,
        keyTones: { [lookup]: "good" },
        note: `Walk the chain: position ${i + 1} is ${lookup} — found it. Total work: 1 hash + ${i + 1} comparison${i === 0 ? "" : "s"}. With short chains this stays effectively O(1).`,
        vars: [["found at", `drawer ${b}, slot ${i}`]],
      });
      break;
    }
    snap({
      activeBucket: b,
      keyTones: { [chain[i]]: "bad" },
      note: `Walk the chain: ${chain[i]} isn't ${lookup}, next.`,
    });
  }
  if (!found) {
    snap({
      activeBucket: b,
      note:
        chain.length === 0
          ? `Drawer ${b} is empty → ${lookup} is definitely not stored. One check answered the question.`
          : `Chain exhausted → ${lookup} is not stored. We still only searched one drawer.`,
      vars: [["found", "no"]],
    });
  }
  return steps;
}
