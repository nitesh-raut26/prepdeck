"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type Lang = "python" | "java" | "cpp";

type LangCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  mounted: boolean;
};

const Ctx = createContext<LangCtx | null>(null);

const STORAGE_KEY = "prepdeck.lang.v1";
const DEFAULT: Lang = "python";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(DEFAULT);
  const [mounted, setMounted] = useState(false);

  // Read from localStorage on mount (after hydration)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Lang | null;
      if (stored && ["python", "java", "cpp"].includes(stored)) {
        setLangState(stored);
      }
    } catch {
      /* ignore */
    }
    setMounted(true);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <Ctx.Provider value={{ lang, setLang, mounted }}>
      {children}
    </Ctx.Provider>
  );
}

export function useLang(): LangCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useLang must be used inside LanguageProvider");
  return ctx;
}
