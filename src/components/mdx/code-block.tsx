"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { Check, Copy, AlertCircle } from "lucide-react";
import { useLang, type Lang } from "@/components/language-provider";

/* ─── Language detection ──────────────────────────────────────────────────── */

const LANG_ALIASES: Record<string, Lang> = {
  python: "python", py: "python", python3: "python",
  java: "java",
  cpp: "cpp", "c++": "cpp", cxx: "cpp", cc: "cpp",
};

type CodeElement = React.ReactElement<{
  className?: string;
  "data-language"?: string;
  children?: React.ReactNode;
}>;

function detectCodeLang(preProps: ComponentProps<"pre">): Lang | null {
  // Method 1: from pre's own className (some rehype configs put it here)
  const preClass = preProps.className ?? "";
  const preMatch = preClass.match(/language-(\w+)/);
  if (preMatch) return LANG_ALIASES[preMatch[1].toLowerCase()] ?? null;

  // Method 2: from children <code> element's className (rehype-highlight default)
  const code = preProps.children as CodeElement | undefined;
  if (!code || typeof code !== "object") return null;

  const codeClass: string = code.props?.className ?? "";
  const dataLang: string = code.props?.["data-language"] ?? "";

  const raw =
    dataLang ||
    codeClass.split(" ").find((c) => c.startsWith("language-"))?.replace("language-", "") ||
    "";

  return LANG_ALIASES[raw.toLowerCase()] ?? null;
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node || typeof node !== "object") return "";
  const el = node as { props?: { children?: React.ReactNode } };
  if (el.props?.children) return extractText(el.props.children);
  return "";
}

/* ─── Labels & colours ────────────────────────────────────────────────────── */

const LANG_LABELS: Record<Lang, string> = { python: "Python", java: "Java", cpp: "C++" };
const LANG_COLORS: Record<Lang, string> = {
  python: "#3b82f6",
  java:   "#f59e0b",
  cpp:    "#10b981",
};

/* ─── Main CodeBlock component ────────────────────────────────────────────── */

export function CodeBlock(preProps: ComponentProps<"pre">) {
  const { lang: selectedLang, mounted } = useLang();
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const codeLang = detectCodeLang(preProps);
  const hidden = mounted && codeLang !== null && codeLang !== selectedLang;

  const copy = () => {
    const text = preRef.current?.innerText ?? extractText(preProps.children);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  const badge      = codeLang ? LANG_LABELS[codeLang] : null;
  const badgeColor = codeLang ? LANG_COLORS[codeLang] : null;

  // Render identical element structure on server and client. When a block's
  // language doesn't match the selected one, hide it via CSS after mount
  // instead of swapping the element type — swapping <div>/<span> shifted
  // siblings and caused a hydration mismatch on pages that mix languages.
  // The block stays in the DOM so the coverage checker can still count it.
  return (
    <div
      suppressHydrationWarning
      className="code-block-wrapper group relative my-5"
      data-code-lang={codeLang ?? "agnostic"}
      data-code-hidden={hidden ? "true" : undefined}
      style={hidden ? { display: "none" } : undefined}
      aria-hidden={hidden ? true : undefined}
    >
      <div className="code-block-header">
        {badge && (
          <span
            className="code-lang-badge"
            style={{ "--badge-color": badgeColor } as React.CSSProperties}
          >
            {badge}
          </span>
        )}
        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          className="code-copy-btn"
          title="Copy to clipboard"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      <pre
        ref={preRef}
        {...preProps}
        className={`${preProps.className ?? ""} !mt-0`}
      />
    </div>
  );
}

/* ─── LanguageCoverageChecker ─────────────────────────────────────────────── */
/**
 * Renders a sticky notice at the bottom of the article when the
 * selected language has zero code blocks on this page.
 * Mount once per article via render.tsx.
 */
export function LanguageCoverageChecker() {
  const { lang, setLang, mounted } = useLang();
  const [missingLang, setMissingLang] = useState<Lang | null>(null);
  const [fallbackLang, setFallbackLang] = useState<Lang | null>(null);

  useEffect(() => {
    if (!mounted) return;

    // Count all language-specific code markers (visible + hidden)
    const allBlocks = document.querySelectorAll("[data-code-lang]");
    const specific = Array.from(allBlocks).filter(
      (b) => b.getAttribute("data-code-lang") !== "agnostic"
    );

    if (specific.length === 0) {
      setMissingLang(null);
      return;
    }

    const matching = specific.filter(
      (b) => b.getAttribute("data-code-lang") === lang
    );

    if (matching.length === 0) {
      setMissingLang(lang);
      // Find what language IS available
      const available = specific.find(
        (b) => b.getAttribute("data-code-lang") !== null
      );
      const avLang = available?.getAttribute("data-code-lang") as Lang | null;
      setFallbackLang(avLang);
    } else {
      setMissingLang(null);
    }
  }, [lang, mounted]);

  if (!missingLang) return null;

  const LANG_LABELS: Record<Lang, string> = { python: "Python", java: "Java", cpp: "C++" };
  const LANG_COLORS: Record<Lang, string> = {
    python: "#3b82f6", java: "#f59e0b", cpp: "#10b981",
  };

  return (
    <div className="lang-coverage-notice" role="alert">
      <AlertCircle className="size-4 flex-shrink-0" />
      <span>
        No <strong>{LANG_LABELS[missingLang]}</strong> examples on this page yet.
        {fallbackLang && (
          <>
            {" "}Showing{" "}
            <button
              type="button"
              className="lang-coverage-switch"
              style={{ color: LANG_COLORS[fallbackLang] }}
              onClick={() => setLang(fallbackLang)}
            >
              {LANG_LABELS[fallbackLang]}
            </button>{" "}
            instead.
          </>
        )}
      </span>
    </div>
  );
}
