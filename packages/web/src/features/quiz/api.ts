import type { PublicQuiz, SubmissionResult } from "@enem-quiz/shared/types";
import type { SubmissionInput } from "@enem-quiz/shared/validators";
import { api } from "@/lib/http";

export const QUIZ_SLUG = "enem";

export const quizKeys = {
  quiz: (slug: string) => ["quiz", slug] as const,
  result: (id: string) => ["result", id] as const,
};

export const fetchQuiz = (slug: string) => api<PublicQuiz>(`/quizzes/${slug}`);

export const submitQuiz = (slug: string, body: SubmissionInput) =>
  api<SubmissionResult>(`/quizzes/${slug}/submissions`, { method: "POST", json: body });

export const fetchResult = (id: string) => api<SubmissionResult>(`/results/${id}`);
