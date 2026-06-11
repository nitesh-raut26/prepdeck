import { describe, expect, it } from "vitest";
import {
  daysUntilDue,
  isDue,
  rateCard,
  retention,
  SRS_INTERVALS_DAYS,
} from "../srs";

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_750_000_000_000;

describe("rateCard", () => {
  it("first 'knew' schedules 1 day out", () => {
    const c = rateCard(undefined, "knew", NOW);
    expect(c).toMatchObject({ status: "known", box: 0, seen: 1, correct: 1 });
    expect(c.due).toBe(NOW + 1 * DAY);
  });

  it("consecutive 'knew' walks the 1/3/7/14/30/60/90 ladder and caps", () => {
    let c = rateCard(undefined, "knew", NOW);
    for (let i = 1; i < SRS_INTERVALS_DAYS.length + 3; i++) {
      c = rateCard(c, "knew", NOW);
      const expectedBox = Math.min(i, SRS_INTERVALS_DAYS.length - 1);
      expect(c.box).toBe(expectedBox);
      expect(c.due).toBe(NOW + SRS_INTERVALS_DAYS[expectedBox] * DAY);
    }
  });

  it("'revise' resets to box 0 and comes back within minutes, not days", () => {
    let c = rateCard(undefined, "knew", NOW);
    c = rateCard(c, "knew", NOW);
    expect(c.box).toBe(1);
    c = rateCard(c, "revise", NOW);
    expect(c.box).toBe(0);
    expect(c.status).toBe("review");
    expect(c.due - NOW).toBeLessThan(DAY);
  });

  it("'knew' after a lapse restarts at box 0 (1 day)", () => {
    let c = rateCard(undefined, "revise", NOW);
    c = rateCard(c, "knew", NOW);
    expect(c.box).toBe(0);
    expect(c.due).toBe(NOW + 1 * DAY);
  });

  it("tracks seen/correct counters", () => {
    let c = rateCard(undefined, "knew", NOW);
    c = rateCard(c, "revise", NOW);
    c = rateCard(c, "knew", NOW);
    expect(c.seen).toBe(3);
    expect(c.correct).toBe(2);
  });
});

describe("isDue / daysUntilDue", () => {
  it("a card is due once its timestamp passes", () => {
    const c = rateCard(undefined, "knew", NOW);
    expect(isDue(c, NOW)).toBe(false);
    expect(isDue(c, NOW + 1 * DAY)).toBe(true);
    expect(daysUntilDue(c, NOW)).toBe(1);
    expect(daysUntilDue(c, NOW + 2 * DAY)).toBe(0);
  });
});

describe("retention", () => {
  it("is null with no ratings and a percentage otherwise", () => {
    expect(retention([])).toBeNull();
    const a = rateCard(undefined, "knew", NOW);
    const b = rateCard(undefined, "revise", NOW);
    expect(retention([a, b])).toBe(50);
  });
});
