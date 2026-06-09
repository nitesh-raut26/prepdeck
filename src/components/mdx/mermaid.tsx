"use client";

import { useEffect, useId, useRef, useState } from "react";

type MermaidApi = {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, text: string) => Promise<{ svg: string }>;
};

let mermaidPromise: Promise<MermaidApi> | null = null;

function loadMermaid(): Promise<MermaidApi> {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((mod) => {
      const mermaid = mod.default as unknown as MermaidApi;
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "strict",
        fontFamily: "inherit",
        themeVariables: {
          background: "transparent",
          primaryColor: "#1e2433",
          primaryBorderColor: "#4f46e5",
          primaryTextColor: "#e7ebf3",
          lineColor: "#64748b",
          fontSize: "14px",
        },
      });
      return mermaid;
    });
  }
  return mermaidPromise;
}

/**
 * Renders a Mermaid diagram. Pass the diagram source via the `chart` prop:
 *   <Mermaid chart={`graph TD; A-->B`} />
 */
export function Mermaid({
  chart,
  children,
}: {
  chart?: string;
  children?: React.ReactNode;
}) {
  const code = (chart ?? (typeof children === "string" ? children : "")).trim();
  const ref = useRef<HTMLDivElement>(null);
  const rawId = useId();
  const id = "m" + rawId.replace(/[^a-zA-Z0-9]/g, "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!code) return;
    loadMermaid()
      .then((mermaid) => mermaid.render(id, code))
      .then(({ svg }) => {
        if (active && ref.current) ref.current.innerHTML = svg;
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      active = false;
    };
  }, [code, id]);

  return (
    <div className="not-prose my-6 overflow-x-auto rounded-xl border border-line bg-surface-2 p-4">
      {error ? (
        <pre className="text-xs text-rose-300">{`Diagram error: ${error}\n\n${code}`}</pre>
      ) : (
        <div ref={ref} className="flex justify-center [&_svg]:max-w-full" />
      )}
    </div>
  );
}
