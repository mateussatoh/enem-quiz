/**
 * Quiz navigation as a pure reducer: easy to test and to persist. Steps 0..n-1 are questions,
 * step n is the contact form. Answers are keyed by question id so going back and changing one
 * never desyncs the rest.
 */

export type QuizState = {
  step: number;
  answers: Record<number, number>;
};

export type QuizAction =
  | { type: "answer"; questionId: number; optionId: number }
  | { type: "next"; total: number }
  | { type: "back" }
  | { type: "goTo"; step: number }
  | { type: "restore"; state: QuizState }
  | { type: "reset" };

export const initialQuizState: QuizState = { step: 0, answers: {} };

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case "answer":
      return { ...state, answers: { ...state.answers, [action.questionId]: action.optionId } };
    case "next":
      return { ...state, step: Math.min(state.step + 1, action.total) };
    case "back":
      return { ...state, step: Math.max(state.step - 1, 0) };
    case "goTo":
      return { ...state, step: Math.max(action.step, 0) };
    case "restore":
      return action.state;
    case "reset":
      return initialQuizState;
  }
}

/** Index of the first unanswered question, or -1 when every question has an answer. */
export function firstUnanswered(questionIds: number[], answers: QuizState["answers"]): number {
  return questionIds.findIndex((id) => answers[id] === undefined);
}

/**
 * Keeps a restored state consistent with the quiz currently served: drops answers to questions
 * or options that no longer exist and never lands past the first gap.
 */
export function reconcile(
  state: QuizState,
  questions: { id: number; options: { id: number }[] }[],
): QuizState {
  const answers: QuizState["answers"] = {};
  for (const q of questions) {
    const optionId = state.answers[q.id];
    if (optionId !== undefined && q.options.some((o) => o.id === optionId))
      answers[q.id] = optionId;
  }
  const gap = firstUnanswered(
    questions.map((q) => q.id),
    answers,
  );
  const maxStep = gap === -1 ? questions.length : gap;
  return { answers, step: Math.min(Math.max(state.step, 0), maxStep) };
}
