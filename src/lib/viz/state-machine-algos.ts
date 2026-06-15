import type { SmStep, StateMachine } from "./types";

/**
 * A state machine is the backbone of countless LLD problems (the State
 * pattern, an elevator, an ATM, an order's lifecycle). The generator is pure:
 * (machine, events) => SmStep[]. It walks the machine event by event and, when
 * an event has no transition out of the current state, records it as ignored —
 * which is exactly the "illegal transition" the State pattern exists to prevent.
 */

export const MACHINES = {
  /** Classic State-pattern teaching example: a media player. */
  "media-player": {
    title: "State pattern — media player",
    initial: "stopped",
    states: [
      { id: "stopped", label: "Stopped", x: 18, y: 44 },
      { id: "playing", label: "Playing", x: 50, y: 14 },
      { id: "paused", label: "Paused", x: 82, y: 44 },
    ],
    transitions: [
      { from: "stopped", to: "playing", event: "play" },
      { from: "playing", to: "paused", event: "pause" },
      { from: "paused", to: "playing", event: "play" },
      { from: "playing", to: "stopped", event: "stop" },
      { from: "paused", to: "stopped", event: "stop" },
    ],
  },
  elevator: {
    title: "Elevator controller",
    initial: "idle",
    states: [
      { id: "idle", label: "Idle", x: 50, y: 12 },
      { id: "up", label: "Up", x: 16, y: 36 },
      { id: "down", label: "Down", x: 84, y: 36 },
      { id: "doors", label: "Doors", x: 50, y: 52 },
    ],
    transitions: [
      { from: "idle", to: "up", event: "callUp" },
      { from: "idle", to: "down", event: "callDown" },
      { from: "up", to: "doors", event: "arrive" },
      { from: "down", to: "doors", event: "arrive" },
      { from: "doors", to: "idle", event: "close" },
    ],
  },
  atm: {
    title: "ATM session",
    initial: "idle",
    states: [
      { id: "idle", label: "Idle", x: 16, y: 16 },
      { id: "card", label: "Card", x: 84, y: 16 },
      { id: "auth", label: "Auth", x: 84, y: 50 },
      { id: "cash", label: "Cash", x: 16, y: 50 },
    ],
    transitions: [
      { from: "idle", to: "card", event: "insertCard" },
      { from: "card", to: "auth", event: "pinOk" },
      { from: "card", to: "idle", event: "pinBad" },
      { from: "auth", to: "cash", event: "withdraw" },
      { from: "cash", to: "idle", event: "done" },
    ],
  },
  "uber-trip": {
    title: "Uber trip lifecycle",
    initial: "req",
    states: [
      { id: "req", label: "Req", x: 16, y: 16 },
      { id: "matched", label: "Matched", x: 84, y: 16 },
      { id: "ontrip", label: "OnTrip", x: 84, y: 50 },
      { id: "ended", label: "Ended", x: 16, y: 50 },
    ],
    transitions: [
      { from: "req", to: "matched", event: "match" },
      { from: "matched", to: "ontrip", event: "pickup" },
      { from: "ontrip", to: "ended", event: "dropoff" },
      { from: "req", to: "ended", event: "cancel" },
      { from: "matched", to: "ended", event: "cancel" },
    ],
  },
  "seat-booking": {
    title: "Seat booking (lock → pay)",
    initial: "free",
    states: [
      { id: "free", label: "Free", x: 18, y: 44 },
      { id: "locked", label: "Locked", x: 50, y: 14 },
      { id: "booked", label: "Booked", x: 82, y: 44 },
    ],
    transitions: [
      { from: "free", to: "locked", event: "lock" },
      { from: "locked", to: "booked", event: "pay" },
      { from: "locked", to: "free", event: "expire" },
      { from: "booked", to: "free", event: "refund" },
    ],
  },
  "chat-message": {
    title: "Message delivery (the ticks)",
    initial: "pending",
    states: [
      { id: "pending", label: "Pend", x: 16, y: 16 },
      { id: "sent", label: "Sent", x: 84, y: 16 },
      { id: "delivered", label: "Deliv", x: 84, y: 50 },
      { id: "read", label: "Read", x: 16, y: 50 },
    ],
    transitions: [
      { from: "pending", to: "sent", event: "ack" },
      { from: "sent", to: "delivered", event: "deliver" },
      { from: "delivered", to: "read", event: "open" },
    ],
  },
  "book-loan": {
    title: "Book copy lifecycle",
    initial: "shelf",
    states: [
      { id: "shelf", label: "Shelf", x: 16, y: 16 },
      { id: "loan", label: "OnLoan", x: 84, y: 16 },
      { id: "held", label: "Held", x: 84, y: 50 },
      { id: "lost", label: "Lost", x: 16, y: 50 },
    ],
    transitions: [
      { from: "shelf", to: "loan", event: "checkout" },
      { from: "loan", to: "shelf", event: "return" },
      { from: "loan", to: "held", event: "returnToHold" },
      { from: "held", to: "loan", event: "pickup" },
      { from: "held", to: "shelf", event: "expire" },
      { from: "loan", to: "lost", event: "lose" },
    ],
  },
  "payment-retry": {
    title: "Payment retry lifecycle",
    initial: "pending",
    states: [
      { id: "pending", label: "Pending", x: 14, y: 14 },
      { id: "sending", label: "Sending", x: 84, y: 14 },
      { id: "backoff", label: "Backoff", x: 84, y: 52 },
      { id: "dead", label: "Dead", x: 16, y: 52 },
      { id: "done", label: "Done", x: 50, y: 86 },
    ],
    transitions: [
      { from: "pending", to: "sending", event: "send" },
      { from: "sending", to: "done", event: "ok" },
      { from: "sending", to: "backoff", event: "fail" },
      { from: "backoff", to: "sending", event: "retry" },
      { from: "backoff", to: "dead", event: "exhaust" },
      { from: "sending", to: "dead", event: "reject" },
    ],
  },
} satisfies Record<string, StateMachine>;

export type MachineId = keyof typeof MACHINES;

export const DEFAULT_EVENTS: Record<MachineId, string> = {
  "media-player": "play, pause, play, stop",
  elevator: "callUp, arrive, close, callDown, arrive, close",
  atm: "insertCard, pinOk, withdraw, done",
  "uber-trip": "match, pickup, dropoff",
  "seat-booking": "lock, pay, refund",
  "chat-message": "ack, deliver, open",
  "book-loan": "checkout, returnToHold, pickup, return",
  "payment-retry": "send, fail, retry, fail, retry, ok",
};

const MAX_EVENTS = 12;

export function parseEvents(raw: string): {
  events: string[] | null;
  error: string | null;
} {
  const events = raw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (events.length === 0) {
    return { events: null, error: "Enter events, e.g. play, pause, stop" };
  }
  if (events.length > MAX_EVENTS) {
    return { events: null, error: `Keep it to ≤ ${MAX_EVENTS} events` };
  }
  return { events, error: null };
}

export function stateMachineSteps(
  machine: StateMachine,
  events: string[],
): SmStep[] {
  const steps: SmStep[] = [];
  const labelOf = (id: string) =>
    machine.states.find((s) => s.id === id)?.label ?? id;

  let current = machine.initial;
  const log: string[] = [];
  const queue = [...events];

  steps.push({
    current,
    active: null,
    event: null,
    log: [],
    upcoming: [...queue],
    note: `Start in ${labelOf(current)}. Each event is handled by the current state — the State pattern moves this branching out of one giant switch and into the state objects themselves.`,
    vars: [["state", labelOf(current)]],
  });

  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    queue.shift();
    const t = machine.transitions.find(
      (tr) => tr.from === current && tr.event === event,
    );
    if (t) {
      log.push(event);
      steps.push({
        current: t.to,
        active: t,
        event,
        accepted: true,
        log: [...log],
        upcoming: [...queue],
        note: `${event}: ${labelOf(current)} handles it and transitions to ${labelOf(t.to)}.`,
        vars: [
          ["event", event],
          ["state", labelOf(t.to)],
        ],
      });
      current = t.to;
    } else {
      log.push(`${event}✕`);
      steps.push({
        current,
        active: null,
        event,
        accepted: false,
        log: [...log],
        upcoming: [...queue],
        note: `${event}: ${labelOf(current)} has no transition for this event, so it's ignored — an illegal move the state simply refuses. No corrupt state, no scattered if-checks.`,
        vars: [
          ["event", `${event} (ignored)`],
          ["state", labelOf(current)],
        ],
      });
    }
  }
  return steps;
}
