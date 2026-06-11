"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  isDue,
  rateCard,
  retention,
  type CardRating,
  type CardRecord,
  type CardStatus,
} from "@/lib/srs";

export type DocStatus = "reviewed" | "mastered";
export type { CardRating, CardRecord, CardStatus };

type State = {
  docs: Record<string, DocStatus>;
  cards: Record<string, CardRecord>;
};

const KEY = "prepdeck.progress.v2";
const LEGACY_KEY = "prepdeck.progress.v1";
const EMPTY: State = { docs: {}, cards: {} };

/** v1 stored cards as plain "known" | "review" — seed the scheduler from it. */
function migrateV1(raw: string): State {
  try {
    const parsed = JSON.parse(raw) as {
      docs?: Record<string, DocStatus>;
      cards?: Record<string, CardStatus>;
    };
    const cards: Record<string, CardRecord> = {};
    for (const [id, status] of Object.entries(parsed.cards ?? {})) {
      cards[id] = rateCard(undefined, status === "known" ? "knew" : "revise");
    }
    return { docs: parsed.docs ?? {}, cards };
  } catch {
    return EMPTY;
  }
}

type ProgressCtx = {
  /** True once localStorage has been read (avoids hydration mismatch). */
  mounted: boolean;
  docs: Record<string, DocStatus>;
  cards: Record<string, CardRecord>;
  getDoc: (href: string) => DocStatus | undefined;
  setDoc: (href: string, status: DocStatus | null) => void;
  /** none → reviewed → mastered → none */
  cycleDoc: (href: string) => void;
  getCard: (id: string) => CardRecord | undefined;
  /** Self-rate a flashcard; the SRS scheduler picks the next due date. */
  rate: (id: string, rating: CardRating) => void;
  clearCard: (id: string) => void;
  /** Card ids due for review right now. */
  dueIds: () => string[];
  /** Recall accuracy across all ratings, 0–100 (null = nothing rated yet). */
  retentionScore: () => number | null;
  /** Counts for a set of doc hrefs (for progress bars). */
  countFor: (hrefs: string[]) => { reviewed: number; mastered: number };
  reset: () => void;
};

const Ctx = createContext<ProgressCtx | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(EMPTY);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<State>;
        setState({ docs: parsed.docs ?? {}, cards: parsed.cards ?? {} });
      } else {
        const legacy = localStorage.getItem(LEGACY_KEY);
        if (legacy) setState(migrateV1(legacy));
      }
    } catch {
      /* ignore corrupt storage */
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore quota errors */
    }
  }, [state, mounted]);

  const setDoc = useCallback((href: string, status: DocStatus | null) => {
    setState((s) => {
      const docs = { ...s.docs };
      if (status === null) delete docs[href];
      else docs[href] = status;
      return { ...s, docs };
    });
  }, []);

  const cycleDoc = useCallback((href: string) => {
    setState((s) => {
      const current = s.docs[href];
      const next: DocStatus | null =
        current === undefined
          ? "reviewed"
          : current === "reviewed"
            ? "mastered"
            : null;
      const docs = { ...s.docs };
      if (next === null) delete docs[href];
      else docs[href] = next;
      return { ...s, docs };
    });
  }, []);

  const rate = useCallback((id: string, rating: CardRating) => {
    setState((s) => ({
      ...s,
      cards: { ...s.cards, [id]: rateCard(s.cards[id], rating) },
    }));
  }, []);

  const clearCard = useCallback((id: string) => {
    setState((s) => {
      const cards = { ...s.cards };
      delete cards[id];
      return { ...s, cards };
    });
  }, []);

  const value = useMemo<ProgressCtx>(
    () => ({
      mounted,
      docs: state.docs,
      cards: state.cards,
      getDoc: (href) => state.docs[href],
      setDoc,
      cycleDoc,
      getCard: (id) => state.cards[id],
      rate,
      clearCard,
      dueIds: () => {
        const now = Date.now();
        return Object.entries(state.cards)
          .filter(([, c]) => isDue(c, now))
          .sort((a, b) => a[1].due - b[1].due)
          .map(([id]) => id);
      },
      retentionScore: () => retention(Object.values(state.cards)),
      countFor: (hrefs) => {
        let reviewed = 0;
        let mastered = 0;
        for (const h of hrefs) {
          const st = state.docs[h];
          if (st === "mastered") mastered++;
          else if (st === "reviewed") reviewed++;
        }
        return { reviewed, mastered };
      },
      reset: () => setState(EMPTY),
    }),
    [mounted, state, setDoc, cycleDoc, rate, clearCard],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProgress(): ProgressCtx {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useProgress must be used within a ProgressProvider");
  return ctx;
}
