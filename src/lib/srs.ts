/**
 * Spaced-repetition scheduling (Leitner-style boxes).
 * Pure functions — no storage, no React — so the schedule is unit-testable.
 *
 * Rating a card "knew" promotes it one box (longer interval);
 * "revise" demotes it to box 0 and makes it due again within minutes,
 * so it comes back before the end of the study session.
 */

export const SRS_INTERVALS_DAYS = [1, 3, 7, 14, 30, 60, 90] as const;

const DAY_MS = 24 * 60 * 60 * 1000;
/** A failed card returns to the queue after this long, not tomorrow. */
const RETRY_MS = 10 * 60 * 1000;

export type CardRating = "knew" | "revise";

/** Visual status used by the QA pill colours (kept from v1). */
export type CardStatus = "known" | "review";

export type CardRecord = {
  status: CardStatus;
  /** Index into SRS_INTERVALS_DAYS. */
  box: number;
  /** Epoch ms when the card is next due. */
  due: number;
  /** Total ratings ever given. */
  seen: number;
  /** Ratings that were "knew". */
  correct: number;
};

export function rateCard(
  prev: CardRecord | undefined,
  rating: CardRating,
  now: number = Date.now(),
): CardRecord {
  const seen = (prev?.seen ?? 0) + 1;
  const correct = (prev?.correct ?? 0) + (rating === "knew" ? 1 : 0);

  if (rating === "revise") {
    return { status: "review", box: 0, due: now + RETRY_MS, seen, correct };
  }

  // "knew": promote. A brand-new card starts at box 0 (due in 1 day);
  // an already-known card moves up until it caps at the last interval.
  const box =
    prev === undefined || prev.status === "review"
      ? 0
      : Math.min(prev.box + 1, SRS_INTERVALS_DAYS.length - 1);
  return {
    status: "known",
    box,
    due: now + SRS_INTERVALS_DAYS[box] * DAY_MS,
    seen,
    correct,
  };
}

export function isDue(card: CardRecord, now: number = Date.now()): boolean {
  return card.due <= now;
}

/** Days until due, rounded up; 0 when already due. */
export function daysUntilDue(card: CardRecord, now: number = Date.now()): number {
  return Math.max(0, Math.ceil((card.due - now) / DAY_MS));
}

/** Overall recall accuracy across rated cards, 0–100, or null if nothing rated. */
export function retention(cards: Iterable<CardRecord>): number | null {
  let seen = 0;
  let correct = 0;
  for (const c of cards) {
    seen += c.seen;
    correct += c.correct;
  }
  return seen === 0 ? null : Math.round((correct / seen) * 100);
}
