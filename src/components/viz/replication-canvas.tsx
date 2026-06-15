import { cn } from "@/lib/cn";
import { CELL_TONE } from "./tones";
import type { ReplicationStep } from "@/lib/viz/types";

/** Leader + two followers as boxes, each showing its applied version and lag;
 *  a read shows fresh (green) vs stale (rose). */
export function ReplicationCanvas({ step }: { step: ReplicationStep }) {
  const leaderV = step.nodes.find((n) => n.role === "leader")?.version ?? 0;

  return (
    <div className="flex min-w-[20rem] flex-col gap-4">
      <div className="flex flex-wrap items-stretch gap-3">
        {step.nodes.map((n) => {
          const lag = n.role === "follower" ? leaderV - n.version : 0;
          return (
            <div
              key={n.id}
              className={cn(
                "flex min-w-[5.5rem] flex-1 flex-col items-center gap-1 rounded-xl border px-4 py-3",
                CELL_TONE[n.tone ?? "idle"],
              )}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
                {n.role}
              </span>
              <span className="font-mono text-sm font-semibold">{n.id}</span>
              <span className="font-mono text-xs">v{n.version}</span>
              {n.role === "follower" && (
                <span
                  className={cn(
                    "rounded-md px-1.5 py-0.5 font-mono text-[10px]",
                    lag === 0
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-amber-500/15 text-amber-300",
                  )}
                >
                  {lag === 0 ? "in sync" : `lag ${lag}`}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {step.readValue && (
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wide text-faint">
            read result
          </span>
          <span
            className={cn(
              "rounded-lg border px-2.5 py-1 font-mono text-xs",
              step.phase === "read-stale" ? CELL_TONE.bad : CELL_TONE.good,
            )}
          >
            {step.readValue} {step.phase === "read-stale" ? "✗ stale" : "✓ fresh"}
          </span>
        </div>
      )}
    </div>
  );
}
