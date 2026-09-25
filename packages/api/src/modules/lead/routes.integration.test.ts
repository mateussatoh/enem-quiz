import { beforeEach, describe, expect, it, vi } from "vitest";

const email = vi.hoisted(() => ({
  send: vi.fn(async (_message: { to: string; subject: string; tag: string }) => ({
    sent: true as const,
    id: "email_1",
  })),
}));
vi.mock("../../core/email", () => ({ sendEmail: email.send }));
import { app } from "../../app";
import { answersFor, fetchQuiz, json, post, resetLeads, validLead } from "../../../test/helpers";

const url = "/api/quizzes/enem/submissions";

describe("POST /api/quizzes/:slug/submissions", () => {
  beforeEach(async () => {
    email.send.mockClear();
    await resetLeads();
  });

  it("scores on the server, persists the lead and returns the result", async () => {
    const quiz = await fetchQuiz();
    // Last option of every question is the best one: 10 points each.
    const answers = answersFor(quiz, (i) => quiz.questions[i]!.options.length - 1);

    const res = await post(url, { answers, lead: validLead });
    expect(res.status).toBe(201);
    const body = await json(res);
    expect(body).toMatchObject({
      firstName: "Ana",
      score: 100,
      band: { key: "final_stretch", label: "Reta final" },
    });
    expect(body.answers).toHaveLength(10);
    expect(body.answers[0]).toEqual({
      position: 1,
      question: quiz.questions[0]!.text,
      answer: "Já terminei e faço cursinho",
    });
    expect(res.headers.get("location")).toBe(`/api/results/${body.resultId}`);

    await vi.waitFor(() => expect(email.send).toHaveBeenCalledOnce());
    expect(email.send.mock.calls[0]![0]).toMatchObject({
      to: "ana@email.com",
      tag: "diagnostic-result",
      subject: "Ana, seu diagnóstico ENEM: 100/100 (Reta final)",
    });

    const again = await app.request(`/api/results/${body.resultId}`);
    expect(again.status).toBe(200);
    expect(await json(again)).toEqual(body);
  });

  it("computes the minimum score from the first options", async () => {
    const quiz = await fetchQuiz();
    const res = await post(url, { answers: answersFor(quiz), lead: validLead });
    const body = await json(res);
    // 2 + 0 + 0 + 0 + 0 + 2 + 0 + 2 + 0 + 2
    expect(body.score).toBe(8);
    expect(body.band.key).toBe("starting");
  });

  it("ignores any score the client tries to send", async () => {
    const quiz = await fetchQuiz();
    const res = await post(url, { answers: answersFor(quiz), lead: validLead, score: 100 });
    expect((await json(res)).score).toBe(8);
  });

  it("returns 400 with field messages for an invalid lead", async () => {
    const quiz = await fetchQuiz();
    const res = await post(url, {
      answers: answersFor(quiz),
      lead: { name: "Al", email: "x@", phone: "123" },
    });
    expect(res.status).toBe(400);
    const { error } = await json(res);
    expect(error.code).toBe("VALIDATION");
    expect(Object.keys(error.fields).sort()).toEqual(["lead.email", "lead.name", "lead.phone"]);
  });

  it("returns 422 when a question is unanswered", async () => {
    const quiz = await fetchQuiz();
    const res = await post(url, { answers: answersFor(quiz).slice(1), lead: validLead });
    expect(res.status).toBe(422);
    expect((await json(res)).error.code).toBe("INCOMPLETE_ANSWERS");
  });

  it("returns 422 for an option from another question", async () => {
    const quiz = await fetchQuiz();
    const answers = answersFor(quiz);
    answers[0]!.optionId = quiz.questions[1]!.options[0]!.id;
    const res = await post(url, { answers, lead: validLead });
    expect(res.status).toBe(422);
    expect((await json(res)).error.code).toBe("INVALID_OPTION");
  });

  it("returns 409 for the same e-mail within 24h, case insensitive", async () => {
    const quiz = await fetchQuiz();
    const answers = answersFor(quiz);
    expect((await post(url, { answers, lead: validLead })).status).toBe(201);
    const dup = await post(url, { answers, lead: { ...validLead, email: "ANA@email.com" } });
    expect(dup.status).toBe(409);
    expect(email.send).toHaveBeenCalledOnce();
    expect((await json(dup)).error.code).toBe("DUPLICATE_LEAD");
  });

  it("creates only one lead for concurrent double submits", async () => {
    const quiz = await fetchQuiz();
    const body = { answers: answersFor(quiz), lead: validLead };
    const statuses = (await Promise.all([post(url, body), post(url, body)])).map((r) => r.status);
    expect(statuses.sort()).toEqual([201, 409]);
  });

  it("returns 429 after too many submissions from one IP", async () => {
    const quiz = await fetchQuiz();
    const answers = answersFor(quiz);
    const headers = { "x-forwarded-for": "203.0.113.7" };
    for (let i = 0; i < 5; i++) {
      const res = await post(
        url,
        { answers, lead: { ...validLead, email: `a${i}@e.com` } },
        headers,
      );
      expect(res.status).toBe(201);
    }
    const res = await post(url, { answers, lead: { ...validLead, email: "a6@e.com" } }, headers);
    expect(res.status).toBe(429);
  });

  it("rejects bots that fill the honeypot", async () => {
    const quiz = await fetchQuiz();
    const res = await post(url, { answers: answersFor(quiz), lead: validLead, website: "spam" });
    expect(res.status).toBe(400);
  });

  it("returns 404 for an unknown result id", async () => {
    const res = await app.request("/api/results/00000000-0000-4000-8000-000000000000");
    expect(res.status).toBe(404);
  });
});
