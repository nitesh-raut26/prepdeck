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
        theme: "base",
        securityLevel: "strict",
        fontFamily: "inherit",
        themeVariables: {
          background: "transparent",
          fontSize: "14px",
          // Warm paper palette — keep in sync with globals.css tokens
          primaryColor: "#f3ecda",
          primaryBorderColor: "#4f46e5",
          primaryTextColor: "#36301e",
          secondaryColor: "#e9dfc6",
          tertiaryColor: "#faf5e9",
          mainBkg: "#f3ecda",
          textColor: "#36301e",
          lineColor: "#7e7458",
          clusterBkg: "#ece3cb",
          clusterBorder: "#c3b58e",
          titleColor: "#36301e",
          edgeLabelBackground: "#faf5e9",
          // sequence diagrams
          actorBkg: "#e9dfc6",
          actorBorder: "#c3b58e",
          actorTextColor: "#36301e",
          actorLineColor: "#a6997a",
          signalColor: "#5c5440",
          signalTextColor: "#5c5440",
          labelBoxBkgColor: "#e9dfc6",
          labelBoxBorderColor: "#c3b58e",
          labelTextColor: "#36301e",
          loopTextColor: "#36301e",
          activationBkgColor: "#e0e7ff",
          activationBorderColor: "#4f46e5",
          sequenceNumberColor: "#faf5e9",
          // notes
          noteBkgColor: "#f8ecc3",
          noteTextColor: "#574a1f",
          noteBorderColor: "#d9c36a",
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
