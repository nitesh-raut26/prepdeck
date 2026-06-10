"use client";

import { useLang, type Lang } from "@/components/language-provider";

const LANGS: { id: Lang; label: string; icon: string }[] = [
  { id: "python", label: "Python", icon: "🐍" },
  { id: "java",   label: "Java",   icon: "☕" },
  { id: "cpp",    label: "C++",    icon: "⚡" },
];

export function LanguageSwitcher() {
  const { lang, setLang, mounted } = useLang();

  if (!mounted) {
    // Avoid hydration mismatch — render a stable placeholder
    return <div className="lang-switcher-skeleton" />;
  }

  return (
    <div className="lang-switcher" role="group" aria-label="Code language preference">
      {LANGS.map(({ id, label, icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => setLang(id)}
          aria-pressed={lang === id}
          title={`Show ${label} code`}
          className={`lang-btn ${lang === id ? "lang-btn-active" : ""} lang-btn-${id}`}
        >
          <span className="lang-icon" aria-hidden="true">{icon}</span>
          <span className="lang-label">{label}</span>
        </button>
      ))}
    </div>
  );
}
