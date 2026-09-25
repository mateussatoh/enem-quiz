import { Hono } from "hono";
import { z } from "zod";
import { fail, validate } from "../../core/http";
import { toPublicQuiz } from "./serialize";
import { getActiveQuizBySlug } from "./service";

export const slugParam = z.object({ slug: z.string().min(1).max(80) });

export const quizRoutes = new Hono().get(
  "/quizzes/:slug",
  validate("param", slugParam),
  async (c) => {
    const quiz = await getActiveQuizBySlug(c.req.valid("param").slug);
    if (!quiz) return fail(c, 404, "QUIZ_NOT_FOUND", "Quiz não encontrado");

    // Short CDN cache: marketing edits show up within a minute, without a frontend deploy.
    c.header("Cache-Control", "public, max-age=0, s-maxage=60, stale-while-revalidate=300");
    return c.json(toPublicQuiz(quiz));
  },
);
