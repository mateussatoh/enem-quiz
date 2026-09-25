import { describe, expect, it } from "vitest";
import {
  firstUnanswered,
  initialQuizState,
  quizReducer,
  reconcile,
  type QuizState,
} from "./quiz-state";

const questions = [
  { id: 1, options: [{ id: 10 }, { id: 11 }] },
  { id: 2, options: [{ id: 20 }, { id: 21 }] },
  { id: 3, options: [{ id: 30 }] },
];

describe("quizReducer", () => {
  it("records an answer and advances until the contact step", () => {
    let s = quizReducer(initialQuizState, { type: "answer", questionId: 1, optionId: 11 });
    s = quizReducer(s, { type: "next", total: 3 });
    s = quizReducer(s, { type: "next", total: 3 });
    s = quizReducer(s, { type: "next", total: 3 });
    s = quizReducer(s, { type: "next", total: 3 });
    expect(s).toEqual({ step: 3, answers: { 1: 11 } });
  });

  it("goes back and lets the answer change without touching others", () => {
    let s: QuizState = { step: 2, answers: { 1: 10, 2: 20 } };
    s = quizReducer(s, { type: "back" });
    s = quizReducer(s, { type: "answer", questionId: 2, optionId: 21 });
    expect(s).toEqual({ step: 1, answers: { 1: 10, 2: 21 } });
    expect(quizReducer({ ...s, step: 0 }, { type: "back" }).step).toBe(0);
  });
});

describe("firstUnanswered", () => {
  it("finds the first gap", () => {
    expect(firstUnanswered([1, 2, 3], { 1: 10, 3: 30 })).toBe(1);
    expect(firstUnanswered([1, 2], { 1: 10, 2: 20 })).toBe(-1);
  });
});

describe("reconcile", () => {
  it("drops answers whose question or option no longer exists", () => {
    const restored = { step: 3, answers: { 1: 10, 2: 99, 7: 70 } };
    expect(reconcile(restored, questions)).toEqual({ step: 1, answers: { 1: 10 } });
  });

  it("keeps a complete state on the contact step", () => {
    const restored = { step: 3, answers: { 1: 10, 2: 20, 3: 30 } };
    expect(reconcile(restored, questions)).toEqual(restored);
  });
});
