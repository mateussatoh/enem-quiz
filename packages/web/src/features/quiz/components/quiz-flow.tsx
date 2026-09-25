"use client";

import type { PublicQuiz } from "@enem-quiz/shared/types";
import type { Lead } from "@enem-quiz/shared/validators";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ErrorState } from "@/components/common/states";
import { Skeleton } from "@/components/ui/skeleton";
import { isApiError } from "@/lib/http";
import { fetchQuiz, QUIZ_SLUG, quizKeys, submitQuiz } from "../api";
import { firstUnanswered } from "../quiz-state";
import { usePersistedQuiz } from "../use-persisted-quiz";
import { ContactStep, type ContactFormErrors } from "./contact-step";
import { QuestionStep } from "./question-step";
import { QuizHeader } from "./quiz-header";

const AUTO_ADVANCE_MS = 280;

export function QuizFlow() {
  const quizQuery = useQuery({
    queryKey: quizKeys.quiz(QUIZ_SLUG),
    queryFn: () => fetchQuiz(QUIZ_SLUG),
  });

  if (quizQuery.isPending) return <QuizSkeleton />;
  if (quizQuery.isError) {
    return (
      <main className="mx-auto max-w-2xl px-5">
        <ErrorState
          message={
            quizQuery.error.code === "NETWORK"
              ? quizQuery.error.message
              : "O quiz está indisponível no momento. Tente novamente em instantes."
          }
          onRetry={() => quizQuery.refetch()}
        />
      </main>
    );
  }
  return <QuizRunner quiz={quizQuery.data} onContentChanged={() => quizQuery.refetch()} />;
}

function QuizRunner({
  quiz,
  onContentChanged,
}: {
  quiz: PublicQuiz;
  onContentChanged: () => void;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { state, dispatch, clear } = usePersistedQuiz(quiz);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [serverErrors, setServerErrors] = useState<ContactFormErrors>();
  const advanceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(advanceTimer.current), []);

  const submission = useMutation({
    mutationFn: ({ lead, website }: { lead: Lead; website: string }) =>
      submitQuiz(QUIZ_SLUG, {
        lead,
        website: website || undefined,
        answers: Object.entries(state.answers).map(([questionId, optionId]) => ({
          questionId: Number(questionId),
          optionId,
        })),
      }),
    onSuccess: (result) => {
      queryClient.setQueryData(quizKeys.result(result.resultId), result);
      clear();
      router.replace(`/resultado/${result.resultId}`);
    },
    onError: (error) => {
      if (!isApiError(error)) return toast.error("Erro inesperado. Tente novamente");
      switch (error.code) {
        case "VALIDATION":
          if (error.fields) {
            setServerErrors({
              name: error.fields["lead.name"],
              email: error.fields["lead.email"],
              phone: error.fields["lead.phone"],
            });
          }
          return toast.error(error.message);
        case "DUPLICATE_LEAD":
          setServerErrors({ email: error.message });
          return;
        case "INCOMPLETE_ANSWERS":
        case "INVALID_OPTION":
          // Content changed while the student was answering: reload it and start over.
          toast.error(error.message);
          dispatch({ type: "reset" });
          return onContentChanged();
        default:
          return toast.error(error.message);
      }
    },
  });

  const total = quiz.questions.length;
  const onContact = state.step >= total;
  const question = quiz.questions[Math.min(state.step, total - 1)]!;
  const answeredCount = Object.keys(state.answers).length;

  const go = (step: number) => {
    clearTimeout(advanceTimer.current);
    setDirection(step > state.step ? 1 : -1);
    dispatch({ type: "goTo", step });
  };

  const next = () => {
    const gap = firstUnanswered(
      quiz.questions.map((q) => q.id),
      state.answers,
    );
    // From the last question, jump to any skipped one before allowing the contact step.
    go(state.step + 1 >= total && gap !== -1 ? gap : state.step + 1);
  };

  const select = (optionId: number) => {
    dispatch({ type: "answer", questionId: question.id, optionId });
    clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      setDirection(1);
      dispatch({ type: "next", total });
    }, AUTO_ADVANCE_MS);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <QuizHeader
        current={onContact ? total : answeredCount}
        total={total}
        label={onContact ? "Quase lá" : `Pergunta ${state.step + 1} de ${total}`}
        onBack={state.step > 0 && !submission.isPending ? () => go(state.step - 1) : undefined}
      />
      <main className="mx-auto w-full max-w-2xl flex-1 overflow-x-clip px-5 pt-8 pb-16 sm:pt-14">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={onContact ? "contact" : question.id}
            custom={direction}
            variants={{
              enter: (d: number) => ({ opacity: 0, x: d * 32 }),
              center: { opacity: 1, x: 0 },
              exit: (d: number) => ({ opacity: 0, x: d * -32 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            {onContact ? (
              <ContactStep
                submitting={submission.isPending}
                serverErrors={serverErrors}
                onSubmit={(lead, website) => {
                  setServerErrors(undefined);
                  submission.mutate({ lead, website });
                }}
              />
            ) : (
              <QuestionStep
                question={question}
                index={state.step}
                total={total}
                selectedOptionId={state.answers[question.id]}
                onSelect={select}
                onNext={next}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function QuizSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl px-5 pt-24" role="status" aria-label="Carregando quiz">
      <Skeleton className="mb-3 h-4 w-32" />
      <Skeleton className="mb-8 h-10 w-4/5" />
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
