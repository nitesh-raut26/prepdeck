"use client";

import { useRef, useState, type ComponentProps } from "react";
import { Check, Copy } from "lucide-react";
import { useLang, type Lang } from "@/components/language-provider";

/* ─── Language detection helpers ─────────────────────────────────────────── */

/**
 * Map every language alias that appears in code fences to a canonical Lang key.
 * Anything not listed here is treated as "language-agnostic" (always shown).
 */
const LANG_ALIASES: Record<string, Lang> = {
  // Python
  python: "python",
  py: "python",
  python3: "python",
  // Java
  java: "java",
  // C++
  cpp: "cpp",
  "c++": "cpp",
  cxx: "cpp",
  cc: "cpp",
};

type CodeElement = React.ReactElement<{
  className?: string;
  "data-language"?: string;
  children?: React.ReactNode;
}>;

/**
 * Reads the `data-highlighted-lang` or `className` attribute that
 * rehype-highlight places on the <code> element inside the <pre>.
 */
function detectCodeLang(preProps: ComponentProps<"pre">): Lang | null {
  const code = preProps.children as CodeElement | undefined;
  if (!code || typeof code !== "object") return null;

  // rehype-highlight adds e.g. className="hljs language-python"
  const className: string = code.props?.className ?? "";

  // also check data attribute set by rehype-highlight
  const dataLang: string = code.props?.["data-language"] ?? "";

  const raw =
    dataLang ||
    className
      .split(" ")
      .find((c) => c.startsWith("language-"))
      ?.replace("language-", "") ||
    "";

  return LANG_ALIASES[raw.toLowerCase()] ?? null;
}

/** Extract raw text from a React subtree (to copy to clipboard). */
function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (!node || typeof node !== "object") return "";
  const el = node as { props?: { children?: React.ReactNode } };
  if (el.props?.children) return extractText(el.props.children);
  return "";
}

/* ─── Language labels ─────────────────────────────────────────────────────── */
const LANG_LABELS: Record<Lang, string> = {
  python: "Python",
  java: "Java",
  cpp: "C++",
};

const LANG_COLORS: Record<Lang, string> = {
  python: "#3b82f6", // blue
  java: "#f59e0b",  // amber
  cpp: "#10b981",   // emerald
};

/* ─── CodeBlock ───────────────────────────────────────────────────────────── */

export function CodeBlock(preProps: ComponentProps<"pre">) {
  const { lang: selectedLang, mounted } = useLang();
  const [copied, setCopied] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  const codeLang = detectCodeLang(preProps);

  // Copy to clipboard
  const copy = () => {
    const text =
      preRef.current?.innerText ??
      extractText(preProps.children);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  // Determine visibility
  // - codeLang === null → language-agnostic code (show always)
  // - codeLang !== null → only show if it matches selectedLang
  const hidden = mounted && codeLang !== null && codeLang !== selectedLang;

  // Badge label (e.g. "Python", "Java", "C++")
  const badge = codeLang ? LANG_LABELS[codeLang] : null;
  const badgeColor = codeLang ? LANG_COLORS[codeLang] : null;

  if (hidden) return null;

  return (
    <div className="code-block-wrapper group relative my-5">
      {/* Language badge + copy button row */}
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
          {copied ? (
            <Check className="size-3.5" />
          ) : (
            <Copy className="size-3.5" />
          )}
        </button>
      </div>

      {/* The actual <pre> — pass all original props */}
      <pre ref={preRef} {...preProps} className={`${preProps.className ?? ""} !mt-0 !rounded-tl-none`} />
    </div>
  );
}
