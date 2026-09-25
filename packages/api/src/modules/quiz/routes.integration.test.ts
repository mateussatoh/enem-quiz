import { describe, expect, it } from "vitest";
import { app } from "../../app";
import { fetchQuiz, json } from "../../../test/helpers";

describe("GET /api/quizzes/:slug", () => {
  it("returns the 10 questions in order without weights", async () => {
    const quiz = await fetchQuiz();
    expect(quiz.questions).toHaveLength(10);
    expect(quiz.questions.map((q) => q.position)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(JSON.stringify(quiz)).not.toContain("weight");
    expect(quiz.questions[0]!.options[0]).toEqual({
      id: expect.any(Number),
      label: expect.any(String),
    });
  });

  it("returns 404 with the standard error shape for an unknown quiz", async () => {
    const res = await app.request("/api/quizzes/nao-existe");
    expect(res.status).toBe(404);
    expect(await json(res)).toEqual({
      error: { code: "QUIZ_NOT_FOUND", message: "Quiz não encontrado" },
    });
  });
});
