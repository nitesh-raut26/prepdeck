import type { ReplicaNode, ReplicationStep } from "./types";

/**
 * Ops for the leader–follower replication demo:
 *   write        — a write lands on the leader (its version advances)
 *   sync1 / sync2 — follower 1/2 applies the next pending write (catches up by 1)
 *   read1 / read2 — read from follower 1/2 (fresh iff caught up to the leader)
 */
export type ReplOp =
  | { kind: "write" }
  | { kind: "sync"; follower: number }
  | { kind: "read"; follower: number };

const MAX_OPS = 12;

export function parseReplOps(raw: string): {
  ops: ReplOp[] | null;
  error: string | null;
} {
  const tokens = raw
    .split(/[,\s]+/)
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0)
    return { ops: null, error: "enter ops, e.g. write write read1 sync1 read1" };
  if (tokens.length > MAX_OPS)
    return { ops: null, error: `keep it to ≤ ${MAX_OPS} ops` };
  const ops: ReplOp[] = [];
  for (const t of tokens) {
    if (t === "write") ops.push({ kind: "write" });
    else if (/^sync[12]$/.test(t))
      ops.push({ kind: "sync", follower: Number(t.slice(4)) });
    else if (/^read[12]$/.test(t))
      ops.push({ kind: "read", follower: Number(t.slice(4)) });
    else return { ops: null, error: `unknown op "${t}" (write / sync1 / read2 …)` };
  }
  return { ops, error: null };
}

/**
 * Steps a leader–follower setup (1 leader + 2 followers) through a script of
 * ops, surfacing replication lag and the read-your-writes anomaly: a read from
 * a follower that hasn't applied the latest write returns a stale value.
 * Pure: (ops) => ReplicationStep[].
 */
export function replicationSteps(ops: ReplOp[]): ReplicationStep[] {
  const nodes: ReplicaNode[] = [
    { id: "Leader", role: "leader", version: 0 },
    { id: "F1", role: "follower", version: 0 },
    { id: "F2", role: "follower", version: 0 },
  ];
  const leader = () => nodes[0];
  const follower = (n: number) => nodes[n]; // F1 = index 1, F2 = index 2

  const snap = (
    phase: ReplicationStep["phase"],
    note: string,
    active: string | null,
    readValue: string | null = null,
  ): ReplicationStep => ({
    nodes: nodes.map((n) => ({
      ...n,
      tone:
        n.id === active
          ? phase === "read-stale"
            ? "bad"
            : "active"
          : n.role === "follower" && n.version < leader().version
            ? "accent"
            : "idle",
    })),
    phase,
    active,
    readValue,
    note,
    vars: nodes.map((n) => [
      n.id,
      n.role === "leader" ? `v${n.version}` : `v${n.version} (lag ${leader().version - n.version})`,
    ]),
  });

  const steps: ReplicationStep[] = [
    snap(
      "start",
      "Writes go to the leader; followers apply the leader's log asynchronously and serve reads. Equal versions = caught up.",
      null,
    ),
  ];

  for (const op of ops) {
    if (op.kind === "write") {
      leader().version += 1;
      steps.push(
        snap(
          "write",
          `write → Leader advances to v${leader().version}. Followers are now behind (replication lag) until they sync.`,
          "Leader",
        ),
      );
    } else if (op.kind === "sync") {
      const f = follower(op.follower);
      if (f.version < leader().version) f.version += 1;
      steps.push(
        snap(
          "replicate",
          `F${op.follower} applies the next write from the log → v${f.version}${
            f.version === leader().version ? " (caught up)" : ` (still lag ${leader().version - f.version})`
          }.`,
          f.id,
        ),
      );
    } else {
      const f = follower(op.follower);
      const fresh = f.version === leader().version;
      steps.push(
        snap(
          fresh ? "read-fresh" : "read-stale",
          fresh
            ? `read F${op.follower} → v${f.version}: fresh — it has the latest write.`
            : `read F${op.follower} → v${f.version}: STALE. The leader is at v${leader().version}; this follower hasn't applied the latest write yet — the read-your-writes anomaly.`,
          f.id,
          `v${f.version}`,
        ),
      );
    }
  }
  return steps;
}
