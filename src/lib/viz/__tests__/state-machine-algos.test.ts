import { describe, expect, it } from "vitest";
import {
  MACHINES,
  parseEvents,
  stateMachineSteps,
} from "../state-machine-algos";

const last = <T,>(a: T[]) => a[a.length - 1];

describe("parseEvents", () => {
  it("splits on commas and whitespace", () => {
    expect(parseEvents("play, pause  stop").events).toEqual([
      "play",
      "pause",
      "stop",
    ]);
  });

  it("rejects empty and over-long input", () => {
    expect(parseEvents("   ").events).toBeNull();
    expect(parseEvents(Array(20).fill("x").join(",")).events).toBeNull();
  });
});

describe("stateMachineSteps", () => {
  it("walks the ATM happy path to a dispense and back to idle", () => {
    const steps = stateMachineSteps(MACHINES.atm, [
      "insertCard",
      "pinOk",
      "withdraw",
      "done",
    ]);
    expect(last(steps).current).toBe("idle");
    // every event after the initial frame was accepted
    expect(steps.slice(1).every((s) => s.accepted)).toBe(true);
  });

  it("ignores an illegal event and stays put", () => {
    // 'withdraw' is not valid from idle.
    const steps = stateMachineSteps(MACHINES.atm, ["withdraw"]);
    const end = last(steps);
    expect(end.current).toBe("idle");
    expect(end.accepted).toBe(false);
    expect(end.active).toBeNull();
    expect(end.note).toContain("ignored");
  });

  it("routes a bad PIN back to idle", () => {
    const steps = stateMachineSteps(MACHINES.atm, ["insertCard", "pinBad"]);
    expect(last(steps).current).toBe("idle");
  });

  it("starts every machine in its declared initial state", () => {
    for (const m of Object.values(MACHINES)) {
      expect(stateMachineSteps(m, [])[0].current).toBe(m.initial);
    }
  });
});
