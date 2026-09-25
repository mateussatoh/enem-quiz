import "server-only";
import { app } from "@enem-quiz/api/app";
import type { PublicQuiz } from "@enem-quiz/shared/types";

/**
 * Server Components call the REST API in-process (same contract, no network hop, no direct DB
 * access). Returns null when the API is unavailable, e.g. a build without a database.
 */
export async function getPublicQuiz(slug: string): Promise<PublicQuiz | null> {
  try {
    const res = await app.request(`/api/quizzes/${slug}`);
    return res.ok ? ((await res.json()) as PublicQuiz) : null;
  } catch {
    return null;
  }
}
