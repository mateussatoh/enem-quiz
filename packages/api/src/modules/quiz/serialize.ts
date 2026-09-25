import type { PublicQuiz } from "@enem-quiz/shared/types";
import type { QuizWithContent } from "./service";

/** Weights never leave the server: the client cannot infer or forge the score. */
export function toPublicQuiz(quiz: QuizWithContent): PublicQuiz {
  return {
    slug: quiz.slug,
    title: quiz.title,
    subtitle: quiz.subtitle,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      position: q.position,
      text: q.text,
      options: q.options.map((o) => ({ id: o.id, label: o.label })),
    })),
  };
}
