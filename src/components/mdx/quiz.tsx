"use client";

import { useState } from "react";
import { CheckCircle2, GraduationCap, RotateCcw, XCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export type QuizQuestion = {
  q: string;
  options: string[];
  /** Index into options. */
  answer: number;
  explain?: string;
};

/**
 * Inline multiple-choice quiz with instant feedback and a score summary.
 * Usage in MDX:
 *   <Quiz questions={[
 *     { q: "…?", options: ["a", "b", "c"], answer: 1, explain: "because…" },
 *   ]} />
 */
export function Quiz({ questions }: { questions: QuizQuestion[] }) {
  const [picked, setPicked] = useState<Record<number, number>>({});

  const answered = Object.keys(picked).length;
  const correct = questions.reduce(
    (acc, qq, i) => acc + (picked[i] === qq.answer ? 1 : 0),
    0,
  );
  const done = answered === questions.length;

  return (
    <div className="not-prose my-6 overflow-hidden rounded-2xl border border-line bg-surface-1">
      <div className="flex items-center justify-between gap-2 border-b border-line bg-surface-2 px-4 py-2.5">
        <span className="flex items-center gap-2 text-sm font-semibold text-ink">
          <GraduationCap className="size-4 text-brand-400" />
          Check yourself
        </span>
        <span className="font-mono text-[11px] text-faint">
          {answered}/{questions.length} answered
          {answered > 0 && ` · ${correct} correct`}
        </span>
      </div>

      <div className="divide-y divide-line">
        {questions.map((qq, qi) => {
          const chosen = picked[qi];
          const isAnswered = chosen !== undefined;
          return (
            <div key={qi} className="px-4 py-4">
              <p className="text-sm font-medium text-ink">
                {qi + 1}. {qq.q}
              </p>
              <div className="mt-2.5 flex flex-col gap-1.5">
                {qq.options.map((opt, oi) => {
                  const isCorrect = oi === qq.answer;
                  const isChosen = chosen === oi;
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => setPicked((p) => ({ ...p, [qi]: oi }))}
                      className={cn(
                        "flex items-start gap-2.5 rounded-lg border px-3 py-2 text-left text-[13px] transition-colors",
                        !isAnswered &&
                          "border-line bg-surface-2 text-subtle hover:border-line-strong hover:bg-surface-3 hover:text-ink",
                        isAnswered && isCorrect &&
                          "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
                        isAnswered && isChosen && !isCorrect &&
                          "border-rose-500/50 bg-rose-500/10 text-rose-300",
                        isAnswered && !isChosen && !isCorrect &&
                          "border-line bg-surface-2 text-faint opacity-60",
                      )}
                    >
                      <span className="mt-0.5 font-mono text-[11px]">
                        {String.fromCharCode(65 + oi)}.
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isAnswered && isCorrect && (
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                      )}
                      {isAnswered && isChosen && !isCorrect && (
                        <XCircle className="mt-0.5 size-4 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
              {isAnswered && qq.explain && (
                <p className="mt-2.5 rounded-lg border border-line bg-surface-2 px-3 py-2 text-[13px] leading-relaxed text-subtle">
                  {qq.explain}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {done && (
        <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-2/60 px-4 py-3">
          <span className="text-sm text-subtle">
            Score:{" "}
            <span
              className={cn(
                "font-semibold",
                correct === questions.length
                  ? "text-emerald-300"
                  : correct >= questions.length / 2
                    ? "text-amber-300"
                    : "text-rose-300",
              )}
            >
              {correct}/{questions.length}
            </span>
            {correct === questions.length
              ? " — perfect. Move on!"
              : " — reread the sections you missed, then retry."}
          </span>
          <button
            type="button"
            onClick={() => setPicked({})}
            className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs text-subtle transition-colors hover:bg-surface-3 hover:text-ink"
          >
            <RotateCcw className="size-3.5" /> Retry
          </button>
        </div>
      )}
    </div>
  );
}
