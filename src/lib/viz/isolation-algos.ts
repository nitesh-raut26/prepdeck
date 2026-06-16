import type { IsolationStep, Tone, TxnOp } from "./types";

export const ISO_SCENARIOS = [
  { id: "dirty", label: "Dirty read" },
  { id: "nonrepeatable", label: "Non-repeatable" },
  { id: "phantom", label: "Phantom" },
] as const;

export const ISO_LEVELS = [
  { id: "read-uncommitted", label: "Read Uncommitted" },
  { id: "read-committed", label: "Read Committed" },
  { id: "repeatable-read", label: "Repeatable Read" },
  { id: "serializable", label: "Serializable" },
] as const;

export type IsoScenario = (typeof ISO_SCENARIOS)[number]["id"];
export type IsoLevel = (typeof ISO_LEVELS)[number]["id"];

/** The SQL-standard anomaly matrix: which anomalies each level still allows. */
const ALLOWS: Record<IsoLevel, Record<IsoScenario, boolean>> = {
  "read-uncommitted": { dirty: true, nonrepeatable: true, phantom: true },
  "read-committed": { dirty: false, nonrepeatable: true, phantom: true },
  "repeatable-read": { dirty: false, nonrepeatable: false, phantom: true },
  serializable: { dirty: false, nonrepeatable: false, phantom: false },
};

type ScenarioDef = {
  init: string;
  ops: { txn: "T1" | "T2"; label: string }[];
  /** Index of T1's anomaly-revealing read. */
  critical: number;
  anomalySees: string;
  safeSees: string;
  anomalyNote: string;
  safeNote: string;
};

const DEFS: Record<IsoScenario, ScenarioDef> = {
  dirty: {
    init: "x = 10 (committed)",
    ops: [
      { txn: "T1", label: "begin" },
      { txn: "T2", label: "begin" },
      { txn: "T2", label: "x := 20 (uncommitted)" },
      { txn: "T1", label: "read x" },
      { txn: "T2", label: "rollback" },
      { txn: "T1", label: "read x" },
    ],
    critical: 3,
    anomalySees: "20",
    safeSees: "10",
    anomalyNote:
      "DIRTY READ — T1 reads 20, a value T2 has not committed and is about to roll back. T1 is acting on data that never existed.",
    safeNote:
      "T1 reads 10, the last committed value. T2's uncommitted 20 is invisible — no dirty read.",
  },
  nonrepeatable: {
    init: "x = 10",
    ops: [
      { txn: "T1", label: "begin" },
      { txn: "T1", label: "read x → 10" },
      { txn: "T2", label: "begin" },
      { txn: "T2", label: "x := 20" },
      { txn: "T2", label: "commit" },
      { txn: "T1", label: "read x" },
    ],
    critical: 5,
    anomalySees: "20",
    safeSees: "10",
    anomalyNote:
      "NON-REPEATABLE READ — T1 reads x again and gets 20, different from its first read of 10. The same row changed under it mid-transaction.",
    safeNote:
      "T1 reads x again and still gets 10 — its snapshot is stable for the whole transaction. The re-read is repeatable.",
  },
  phantom: {
    init: "2 rows WHERE status = 'pending'",
    ops: [
      { txn: "T1", label: "begin" },
      { txn: "T1", label: "count pending → 2" },
      { txn: "T2", label: "begin" },
      { txn: "T2", label: "insert pending row" },
      { txn: "T2", label: "commit" },
      { txn: "T1", label: "count pending" },
    ],
    critical: 5,
    anomalySees: "3",
    safeSees: "2",
    anomalyNote:
      "PHANTOM READ — the same range query now returns 3 rows; a new row matching T1's WHERE appeared mid-transaction.",
    safeNote:
      "The range query still returns 2 — the phantom row T2 inserted is invisible to T1's snapshot.",
  },
};

/**
 * Steps two interleaved transactions through a chosen anomaly scenario at a
 * chosen isolation level, showing what T1 observes at its critical read and
 * whether the anomaly is allowed or prevented (per the SQL-standard matrix).
 * Pure: (scenario, level) => IsolationStep[].
 */
export function isolationSteps(
  scenario: IsoScenario,
  level: IsoLevel,
): IsolationStep[] {
  const def = DEFS[scenario];
  const anomaly = ALLOWS[level][scenario];
  const levelLabel = ISO_LEVELS.find((l) => l.id === level)!.label;
  const steps: IsolationStep[] = [];

  const toneFor = (i: number, activeIndex: number): Tone => {
    if (i === def.critical && activeIndex >= def.critical)
      return anomaly ? "bad" : "good";
    if (i === activeIndex) return "active";
    if (i < activeIndex) return "muted";
    return "idle";
  };

  const snap = (
    activeIndex: number,
    note: string,
    opts: {
      t1Sees?: string | null;
      verdict?: "anomaly" | "prevented" | null;
      vars?: [string, string | number][];
    } = {},
  ) => {
    const ops: TxnOp[] = def.ops.map((o, i) => ({
      ...o,
      tone: toneFor(i, activeIndex),
    }));
    steps.push({
      scenario,
      level: levelLabel,
      ops,
      activeIndex,
      t1Sees: opts.t1Sees ?? null,
      verdict: opts.verdict ?? null,
      note,
      vars: opts.vars,
    });
  };

  snap(
    -1,
    `Two transactions interleave at ${levelLabel}. Initial state: ${def.init}. Watch what T1 sees at its critical read.`,
    { vars: [["isolation", levelLabel]] },
  );

  def.ops.forEach((o, i) => {
    if (i === def.critical) {
      snap(i, anomaly ? def.anomalyNote : def.safeNote, {
        t1Sees: anomaly ? def.anomalySees : def.safeSees,
        verdict: anomaly ? "anomaly" : "prevented",
        vars: [
          ["T1 sees", anomaly ? def.anomalySees : def.safeSees],
          ["verdict", anomaly ? "anomaly ✗" : "prevented ✓"],
        ],
      });
    } else {
      snap(i, `${o.txn}: ${o.label}.`);
    }
  });

  snap(
    def.ops.length,
    anomaly
      ? `${levelLabel} ALLOWS this anomaly — raise the isolation level to prevent it.`
      : `${levelLabel} PREVENTS this anomaly, at the cost of more locking / coordination.`,
    {
      verdict: anomaly ? "anomaly" : "prevented",
      vars: [
        ["isolation", levelLabel],
        ["result", anomaly ? "anomaly ✗" : "prevented ✓"],
      ],
    },
  );

  return steps;
}
