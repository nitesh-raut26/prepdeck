import type { ParkingStep, Tone, VehicleSize } from "./types";

/**
 * Parking-lot allocation, stepped. The generator is pure: (ops) => steps. It
 * scans for the nearest spot a vehicle fits — a motorcycle fits anywhere, a car
 * needs a compact-or-larger spot, a large vehicle needs a large spot. The scan
 * makes the "spot-assignment" decision (a Strategy in the real design) visible.
 */
const LAYOUT: VehicleSize[] = ["M", "M", "C", "C", "C", "L", "L"];
const RANK: Record<VehicleSize, number> = { M: 0, C: 1, L: 2 };
const SIZE_NAME: Record<VehicleSize, string> = {
  M: "motorcycle",
  C: "car",
  L: "large",
};

export type ParkingOp =
  | { type: "park"; size: VehicleSize }
  | { type: "leave"; label: string };

const OP_RE = /(park|leave)\s+([MCL]\d+|[MCL])/gi;
const MAX_OPS = 12;

export function parseParkingOps(raw: string): {
  ops: ParkingOp[] | null;
  error: string | null;
} {
  const ops: ParkingOp[] = [];
  let m: RegExpExecArray | null;
  OP_RE.lastIndex = 0;
  while ((m = OP_RE.exec(raw))) {
    const verb = m[1].toLowerCase();
    const arg = m[2].toUpperCase();
    if (verb === "park") {
      if (arg.length !== 1) return { ops: null, error: "park takes a size: park M | park C | park L" };
      ops.push({ type: "park", size: arg as VehicleSize });
    } else {
      ops.push({ type: "leave", label: arg });
    }
  }
  if (ops.length === 0) {
    return { ops: null, error: "Try: park C, park M, park L, leave C1, park L" };
  }
  if (ops.length > MAX_OPS) return { ops: null, error: `Keep it to ≤ ${MAX_OPS} ops` };
  return { ops, error: null };
}

export function parkingSteps(ops: ParkingOp[]): ParkingStep[] {
  const spots = LAYOUT.map((size, id) => ({
    id,
    size,
    occupant: null as string | null,
  }));
  const counts: Record<VehicleSize, number> = { M: 0, C: 0, L: 0 };
  const steps: ParkingStep[] = [];

  const snap = (s: {
    note: string;
    op?: string;
    cursor?: number | null;
    tones?: Record<number, Tone>;
    vars?: [string, string | number][];
  }) => {
    const tones = s.tones ?? {};
    steps.push({
      spots: spots.map((sp) => ({ ...sp, tone: tones[sp.id] })),
      cursor: s.cursor ?? null,
      op: s.op,
      note: s.note,
      vars: s.vars,
    });
  };

  snap({
    note: `7 spots: two motorcycle (M), three compact (C), two large (L). A vehicle parks in the nearest spot it fits — bigger spots accept smaller vehicles, never the reverse.`,
    vars: [["free", spots.length]],
  });

  for (const op of ops) {
    if (op.type === "park") {
      const label = `${op.size}${++counts[op.size]}`;
      snap({
        op: `park ${op.size}`,
        note: `${label} (a ${SIZE_NAME[op.size]}) arrives. Scan from the entrance for the first free spot ranked ${op.size} or larger.`,
        vars: [["vehicle", label]],
      });
      let placed = false;
      for (let i = 0; i < spots.length; i++) {
        const sp = spots[i];
        if (sp.occupant) {
          snap({
            op: `park ${op.size}`,
            cursor: i,
            tones: { [i]: "muted" },
            note: `Spot ${i} holds ${sp.occupant} — taken, keep scanning.`,
          });
          continue;
        }
        if (RANK[sp.size] < RANK[op.size]) {
          snap({
            op: `park ${op.size}`,
            cursor: i,
            tones: { [i]: "bad" },
            note: `Spot ${i} is ${sp.size} — too small for a ${SIZE_NAME[op.size]}. Skip.`,
          });
          continue;
        }
        sp.occupant = label;
        placed = true;
        snap({
          op: `park ${op.size}`,
          cursor: i,
          tones: { [i]: "good" },
          note: `Spot ${i} is a free ${sp.size} — it fits. Park ${label} here and hand back a ticket pointing at spot ${i}.`,
          vars: [["vehicle", label], ["spot", i]],
        });
        break;
      }
      if (!placed) {
        snap({
          op: `park ${op.size}`,
          note: `No free spot fits ${label} — the lot is full for ${SIZE_NAME[op.size]}s. Reject (or queue).`,
          vars: [["vehicle", label], ["result", "rejected"]],
        });
      }
    } else {
      const i = spots.findIndex((sp) => sp.occupant === op.label);
      if (i === -1) {
        snap({
          op: `leave ${op.label}`,
          note: `${op.label} isn't parked here — nothing to free.`,
        });
      } else {
        spots[i].occupant = null;
        snap({
          op: `leave ${op.label}`,
          cursor: i,
          tones: { [i]: "good" },
          note: `${op.label} leaves — spot ${i} is free again and goes back into the pool for the next arrival.`,
          vars: [["freed", `spot ${i}`]],
        });
      }
    }
  }
  return steps;
}
