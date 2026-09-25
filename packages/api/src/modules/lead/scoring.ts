import { calculateScore, getBand, type Band } from "@enem-quiz/shared/domain";
import type { Submission } from "@enem-quiz/shared/validators";
import type { QuizWithContent } from "../quiz/service";

export type ScoredAnswer = {
  position: number;
  questionId: number;
  optionId: number;
  questionText: string;
  optionLabel: string;
  weight: number;
};

export type ScoringResult =
  | { ok: true; score: number; band: Band; answers: ScoredAnswer[] }
  | { ok: false; reason: "INCOMPLETE_ANSWERS" | "INVALID_OPTION" };

/**
 * Resolves the submitted option ids against the quiz stored in the database and scores them.
 * Weights come only from the database; the client sends ids, never points.
 */
export function scoreSubmission(
  quiz: QuizWithContent,
  answers: Submission["answers"],
): ScoringResult {
  const byQuestion = new Map(answers.map((a) => [a.questionId, a.optionId]));

  if (answers.some((a) => !quiz.questions.some((q) => q.id === a.questionId))) {
    return { ok: false, reason: "INVALID_OPTION" };
  }

  const scored: ScoredAnswer[] = [];
  for (const question of quiz.questions) {
    const optionId = byQuestion.get(question.id);
    if (optionId === undefined) return { ok: false, reason: "INCOMPLETE_ANSWERS" };

    const option = question.options.find((o) => o.id === optionId);
    if (!option) return { ok: false, reason: "INVALID_OPTION" };

    scored.push({
      position: question.position,
      questionId: question.id,
      optionId: option.id,
      questionText: question.text,
      optionLabel: option.label,
      weight: option.weight,
    });
  }

  const score = calculateScore(scored.map((a) => a.weight));
  return { ok: true, score, band: getBand(score), answers: scored };
}
