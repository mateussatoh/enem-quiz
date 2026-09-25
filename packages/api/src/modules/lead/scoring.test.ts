import { describe, expect, it } from "vitest";
import type { QuizWithContent } from "../quiz/service";
import { scoreSubmission } from "./scoring";

// Two questions, weights chosen so both band edges are easy to hit.
const quiz = {
  id: 1,
  slug: "t",
  title: "t",
  subtitle: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  questions: [
    {
      id: 10,
      quizId: 1,
      position: 1,
      text: "Q1",
      options: [
        { id: 100, questionId: 10, position: 1, label: "A", weight: 0 },
        { id: 101, questionId: 10, position: 2, label: "B", weight: 12 },
      ],
    },
    {
      id: 20,
      quizId: 1,
      position: 2,
      text: "Q2",
      options: [
        { id: 200, questionId: 20, position: 1, label: "C", weight: 2 },
        { id: 201, questionId: 20, position: 2, label: "D", weight: 10 },
      ],
    },
  ],
} satisfies QuizWithContent;

describe("scoreSubmission", () => {
  it("scores from database weights and snapshots each answer", () => {
    const result = scoreSubmission(quiz, [
      { questionId: 20, optionId: 201 },
      { questionId: 10, optionId: 101 },
    ]);
    expect(result).toEqual({
      ok: true,
      score: 22,
      band: expect.objectContaining({ key: "starting" }),
      answers: [
        {
          position: 1,
          questionId: 10,
          optionId: 101,
          questionText: "Q1",
          optionLabel: "B",
          weight: 12,
        },
        {
          position: 2,
          questionId: 20,
          optionId: 201,
          questionText: "Q2",
          optionLabel: "D",
          weight: 10,
        },
      ],
    });
  });

  it("rejects a missing answer", () => {
    expect(scoreSubmission(quiz, [{ questionId: 10, optionId: 100 }])).toEqual({
      ok: false,
      reason: "INCOMPLETE_ANSWERS",
    });
  });

  it("rejects an option that belongs to another question", () => {
    const result = scoreSubmission(quiz, [
      { questionId: 10, optionId: 200 },
      { questionId: 20, optionId: 201 },
    ]);
    expect(result).toEqual({ ok: false, reason: "INVALID_OPTION" });
  });

  it("rejects a question that is not part of the quiz", () => {
    const result = scoreSubmission(quiz, [
      { questionId: 10, optionId: 100 },
      { questionId: 20, optionId: 200 },
      { questionId: 99, optionId: 999 },
    ]);
    expect(result).toEqual({ ok: false, reason: "INVALID_OPTION" });
  });
});
