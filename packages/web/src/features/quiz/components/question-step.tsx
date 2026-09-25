"use client";

import type { PublicQuestion } from "@enem-quiz/shared/types";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  question: PublicQuestion;
  index: number;
  total: number;
  selectedOptionId: number | undefined;
  onSelect: (optionId: number) => void;
  onNext: () => void;
};

export function QuestionStep({
  question,
  index,
  total,
  selectedOptionId,
  onSelect,
  onNext,
}: Props) {
  const groupId = `question-${question.id}`;

  return (
    <section aria-labelledby={groupId} className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-sm font-medium tracking-wide text-brand uppercase">
          Pergunta {index + 1} de {total}
        </p>
        <h1 id={groupId} className="font-serif text-[1.9rem] leading-tight text-ink sm:text-4xl">
          {question.text}
        </h1>
      </div>

      <div role="radiogroup" aria-labelledby={groupId} className="flex flex-col gap-3">
        {question.options.map((option, i) => {
          const selected = option.id === selectedOptionId;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onSelect(option.id)}
              className={cn(
                "group flex min-h-16 w-full items-center gap-4 rounded-xl border-2 bg-surface-card px-4 py-3 text-left text-base transition-all outline-none",
                "hover:border-brand-line hover:bg-brand-soft/40 focus-visible:ring-[3px] focus-visible:ring-brand-line active:scale-[0.99]",
                selected ? "border-brand bg-brand-soft/60 shadow-sm" : "border-line",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-lg border text-sm font-semibold transition-colors",
                  selected
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-surface-page text-subtle group-hover:border-brand-line group-hover:text-brand",
                )}
              >
                {selected ? <Check className="size-4" /> : String.fromCharCode(65 + i)}
              </span>
              <span className={cn("text-ink-soft", selected && "font-medium text-ink")}>
                {option.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Picking an option advances on its own; this is for returning users who keep their answer. */}
      {selectedOptionId !== undefined && (
        <Button size="lg" onClick={onNext} className="self-end">
          {index + 1 === total ? "Ver meu resultado" : "Próxima"}
          <ArrowRight />
        </Button>
      )}
    </section>
  );
}
