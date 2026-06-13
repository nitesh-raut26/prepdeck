import { describe, expect, it } from "vitest";
import { observerSteps, parseObserverOps } from "../observer-algos";
import { parkingSteps, parseParkingOps } from "../parking-algos";
import { parseDebts, splitwiseSteps } from "../split-algos";

const last = <T,>(a: T[]) => a[a.length - 1];

describe("observerSteps", () => {
  it("parses sub / unsub / pub", () => {
    expect(parseObserverOps("sub Chart, unsub Chart, pub 9").ops).toEqual([
      { type: "sub", who: "Chart" },
      { type: "unsub", who: "Chart" },
      { type: "pub", value: "9" },
    ]);
  });

  it("delivers a publish to exactly the current subscribers", () => {
    const steps = observerSteps(
      parseObserverOps("sub A, sub B, pub 1").ops!,
    );
    const delivered = steps.map((s) => s.delivering).filter(Boolean);
    expect(delivered).toEqual(["A", "B"]);
  });

  it("stops delivering to an unsubscribed observer", () => {
    const steps = observerSteps(
      parseObserverOps("sub A, sub B, unsub A, pub 1").ops!,
    );
    const delivered = steps.map((s) => s.delivering).filter(Boolean);
    expect(delivered).toEqual(["B"]);
  });
});

describe("parkingSteps", () => {
  it("parks a car in the first compact-or-larger spot, not a motorcycle spot", () => {
    // layout: M M C C C L L
    const end = last(parkingSteps(parseParkingOps("park C").ops!));
    expect(end.spots[0].occupant).toBeNull(); // M spot left free
    expect(end.spots[2].occupant).toBe("C1"); // first C spot taken
  });

  it("rejects a large vehicle once both large spots are full", () => {
    const steps = parkingSteps(parseParkingOps("park L, park L, park L").ops!);
    expect(last(steps).note).toContain("full");
  });

  it("frees the spot on leave", () => {
    const end = last(parkingSteps(parseParkingOps("park C, leave C1").ops!));
    expect(end.spots[2].occupant).toBeNull();
  });
});

describe("splitwiseSteps", () => {
  const debts = parseDebts("A->B:10, B->C:20, C->D:30, D->A:15, A->C:5").debts!;

  it("ends with everyone settled to zero", () => {
    const end = last(splitwiseSteps(debts));
    expect(end.people.every((p) => Math.abs(p.balance) < 1e-9)).toBe(true);
  });

  it("uses at most (people − 1) transfers and fewer than the raw debts", () => {
    const end = last(splitwiseSteps(debts));
    const people = end.people.length;
    expect(end.settlements.length).toBeLessThanOrEqual(people - 1);
    expect(end.settlements.length).toBeLessThan(end.rawCount);
  });

  it("conserves money — transfers net to each person's original balance", () => {
    const steps = splitwiseSteps(debts);
    // sum of all transfers out minus in per person must zero the start balance
    const start = steps[0].people;
    const net = new Map(start.map((p) => [p.id, p.balance]));
    for (const s of last(steps).settlements) {
      net.set(s.from, net.get(s.from)! + s.amount);
      net.set(s.to, net.get(s.to)! - s.amount);
    }
    for (const v of net.values()) expect(Math.abs(v)).toBeLessThan(1e-9);
  });
});
