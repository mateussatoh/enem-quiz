import type { PublicQuiz } from "@enem-quiz/shared/types";
import { app } from "../src/app";
import { db } from "../src/core/db";
import { QUIZ_SLUG } from "../src/db/quiz-content";
import { leads } from "../src/db/schema";

export const validLead = { name: "Ana Souza", email: "ana@email.com", phone: "(11) 98765-4321" };

export async function resetLeads() {
  await db().delete(leads);
}

export async function fetchQuiz(): Promise<PublicQuiz> {
  const res = await app.request(`/api/quizzes/${QUIZ_SLUG}`);
  return (await res.json()) as PublicQuiz;
}

/** Picks option index `pick(questionIndex)` for every question. */
export function answersFor(quiz: PublicQuiz, pick: (qIndex: number) => number = () => 0) {
  return quiz.questions.map((q, i) => ({ questionId: q.id, optionId: q.options[pick(i)]!.id }));
}

export function post(path: string, body: unknown, headers: Record<string, string> = {}) {
  return app.request(path, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

export async function loginCookie(): Promise<string> {
  const res = await post("/api/auth/login", {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });
  const cookie = res.headers.get("set-cookie");
  if (!cookie) throw new Error("login failed in test helper");
  return cookie.split(";")[0]!;
}

// Response#json is typed as unknown; tests assert on shape, so loosen it in one place.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const json = async (res: Response | Promise<Response>): Promise<any> => (await res).json();
