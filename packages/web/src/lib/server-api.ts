import "server-only";
import { app } from "@enem-quiz/api/app";
import type { PublicQuiz } from "@enem-quiz/shared/types";
import { cache } from "react";

/**
 * Server Components call the REST API in-process (same contract, no network hop, no direct DB
 * access). Memoized per request, so metadata and page share one call.
 *
 * During `next build` an unavailable API returns null and the page renders its fallback copy.
 * At runtime (ISR revalidation) it throws instead, so Next keeps serving the last good page
 * rather than caching the fallback.
 */
export const getPublicQuiz = cache(async (slug: string): Promise<PublicQuiz | null> => {
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  try {
    const res = await app.request(`/api/quizzes/${slug}`);
    if (res.ok) return (await res.json()) as PublicQuiz;
    if (res.status === 404) return null;
    throw new Error(`quiz API answered ${res.status}`);
  } catch (error) {
    if (isBuild) return null;
    throw error;
  }
});
