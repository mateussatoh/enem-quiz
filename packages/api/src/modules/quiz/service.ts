import { and, asc, eq } from "drizzle-orm";
import { db } from "../../core/db";
import { options, questions, quizzes } from "./schema";

/** Full quiz including weights. Internal only: routes must go through serialize before replying. */
export async function getActiveQuizBySlug(slug: string) {
  const quiz = await db().query.quizzes.findFirst({
    where: and(eq(quizzes.slug, slug), eq(quizzes.isActive, true)),
    with: {
      questions: {
        orderBy: asc(questions.position),
        with: { options: { orderBy: asc(options.position) } },
      },
    },
  });
  return quiz ?? null;
}

export type QuizWithContent = NonNullable<Awaited<ReturnType<typeof getActiveQuizBySlug>>>;
