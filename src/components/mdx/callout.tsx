import { Info, Lightbulb, TriangleAlert, OctagonAlert } from "lucide-react";
import { cn } from "@/lib/cn";

type CalloutType = "info" | "tip" | "warn" | "danger";

const STYLES: Record<
  CalloutType,
  { icon: typeof Info; ring: string; tint: string; text: string }
> = {
  info: {
    icon: Info,
    ring: "border-sky-500/40",
    tint: "bg-sky-500/10",
    text: "text-sky-300",
  },
  tip: {
    icon: Lightbulb,
    ring: "border-emerald-500/40",
    tint: "bg-emerald-500/10",
    text: "text-emerald-300",
  },
  warn: {
    icon: TriangleAlert,
    ring: "border-amber-500/40",
    tint: "bg-amber-500/10",
    text: "text-amber-300",
  },
  danger: {
    icon: OctagonAlert,
    ring: "border-rose-500/40",
    tint: "bg-rose-500/10",
    text: "text-rose-300",
  },
};

/** Highlighted note. Usage: <Callout type="tip" title="Interview tip">…</Callout> */
export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: CalloutType;
  title?: string;
  children: React.ReactNode;
}) {
  const s = STYLES[type];
  const Icon = s.icon;
  return (
    <div
      className={cn(
        "not-prose my-5 flex gap-3 rounded-xl border p-4",
        s.ring,
        s.tint,
      )}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", s.text)} />
      <div className="min-w-0 flex-1">
        {title && (
          <div className={cn("mb-1 font-semibold", s.text)}>{title}</div>
        )}
        <div className="prose prose-invert max-w-none prose-sm text-subtle">
          {children}
        </div>
      </div>
    </div>
  );
}
