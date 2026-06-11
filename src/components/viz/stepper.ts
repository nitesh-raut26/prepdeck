"use client";

import { useEffect, useState } from "react";

/** Base playback interval at 1× speed. */
const TICK_MS = 1100;

/**
 * Owns playback state for a step sequence: play/pause, step forward/back,
 * scrub, speed. Resets whenever a new `steps` array is supplied (i.e. the
 * user changed the input and the algorithm was re-run).
 */
export function useStepper<S>(steps: S[]) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // New steps (input changed) → rewind.
  useEffect(() => {
    setIdx(0);
    setPlaying(false);
  }, [steps]);

  useEffect(() => {
    if (!playing) return;
    if (idx >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(
      () => setIdx((i) => Math.min(i + 1, steps.length - 1)),
      TICK_MS / speed,
    );
    return () => clearTimeout(t);
  }, [playing, idx, speed, steps]);

  const atEnd = idx >= steps.length - 1;

  return {
    idx,
    step: steps[Math.min(idx, steps.length - 1)],
    total: steps.length,
    playing,
    speed,
    atEnd,
    setSpeed,
    seek: (i: number) => setIdx(Math.max(0, Math.min(i, steps.length - 1))),
    next: () => {
      setPlaying(false);
      setIdx((i) => Math.min(i + 1, steps.length - 1));
    },
    prev: () => {
      setPlaying(false);
      setIdx((i) => Math.max(i - 1, 0));
    },
    reset: () => {
      setPlaying(false);
      setIdx(0);
    },
    toggle: () => {
      if (atEnd) {
        // Pressing play at the end restarts.
        setIdx(0);
        setPlaying(true);
      } else {
        setPlaying((p) => !p);
      }
    },
  };
}

export type Stepper<S> = ReturnType<typeof useStepper<S>>;
