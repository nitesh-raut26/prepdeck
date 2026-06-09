"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type DocStatus = "reviewed" | "mastered";
export type CardStatus = "known" | "review";

type State = {
  docs: Record<string, DocStatus>;
  cards: Record<string, CardStatus>;
};

const KEY = "prepdeck.progress.v1";
const EMPTY: State = { docs: {}, cards: {} };

type ProgressCtx = {
  /** True once localStorage has been read (avoids hydration mismatch). */
  mounted: boolean;
  docs: Record<string, DocStatus>;
  cards: Record<string, CardStatus>;
  getDoc: (href: string) => DocStatus | undefined;
  setDoc: (href: string, status: DocStatus | null) => void;
  /** none → reviewed → mastered → none */
  cycleDoc: (href: string) => void;
  getCard: (id: string) => CardStatus | undefined;
  setCard: (id: string, status: CardStatus | null) => void;
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

  const setCard = useCallback((id: string, status: CardStatus | null) => {
    setState((s) => {
      const cards = { ...s.cards };
      if (status === null) delete cards[id];
      else cards[id] = status;
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
      setCard,
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
    [mounted, state, setDoc, cycleDoc, setCard],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useProgress(): ProgressCtx {
  const ctx = useContext(Ctx);
  if (!ctx)
    throw new Error("useProgress must be used within a ProgressProvider");
  return ctx;
}
