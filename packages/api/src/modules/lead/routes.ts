import { submissionSchema } from "@enem-quiz/shared/validators";
import { Hono } from "hono";
import { z } from "zod";
import { runInBackground } from "../../core/background";
import { hashIp } from "../../core/crypto";
import { sendEmail } from "../../core/email";
import { env } from "../../core/env";
import { fail, validate } from "../../core/http";
import { logEvent } from "../../core/logger";
import { clientIp } from "../../core/request";
import { slugParam } from "../quiz/routes";
import { getActiveQuizBySlug } from "../quiz/service";
import { renderResultEmail } from "./result-email";
import { scoreSubmission } from "./scoring";
import { toSubmissionResult } from "./serialize";
import { createLead, getLeadWithAnswers, DUPLICATE_WINDOW_HOURS } from "./service";

const resultParam = z.object({ id: z.uuid() });

export const leadRoutes = new Hono()
  .post(
    "/quizzes/:slug/submissions",
    validate("param", slugParam),
    validate("json", submissionSchema),
    async (c) => {
      const submission = c.req.valid("json");

      if (submission.website) {
        logEvent("warn", "submission.honeypot", {});
        return fail(c, 400, "VALIDATION", "Não foi possível enviar suas respostas");
      }

      const quiz = await getActiveQuizBySlug(c.req.valid("param").slug);
      if (!quiz) return fail(c, 404, "QUIZ_NOT_FOUND", "Quiz não encontrado");

      const scored = scoreSubmission(quiz, submission.answers);
      if (!scored.ok) {
        return scored.reason === "INCOMPLETE_ANSWERS"
          ? fail(c, 422, "INCOMPLETE_ANSWERS", "Responda todas as perguntas antes de enviar")
          : fail(
              c,
              422,
              "INVALID_OPTION",
              "Alguma resposta não pertence a este quiz. Recarregue a página",
            );
      }

      const ip = clientIp(c);
      const created = await createLead({
        quizId: quiz.id,
        lead: submission.lead,
        score: scored.score,
        band: scored.band.key,
        answers: scored.answers,
        ipHash: ip ? hashIp(ip, env().SESSION_SECRET) : null,
      });

      if (!created.ok) {
        logEvent("warn", `submission.${created.reason.toLowerCase()}`, { quiz: quiz.slug });
        return created.reason === "RATE_LIMITED"
          ? fail(
              c,
              429,
              "RATE_LIMITED",
              "Muitos envios em pouco tempo. Tente novamente em alguns minutos",
            )
          : fail(
              c,
              409,
              "DUPLICATE_LEAD",
              `Já recebemos um diagnóstico com este e-mail nas últimas ${DUPLICATE_WINDOW_HOURS} horas`,
            );
      }

      logEvent("info", "submission.created", { leadId: created.lead.id, score: scored.score });
      const result = toSubmissionResult((await getLeadWithAnswers(created.lead.id))!);

      // The student sees the result right away; the e-mail copy goes out after the response.
      const resultUrl = `${env().APP_URL ?? new URL(c.req.url).origin}/resultado/${result.resultId}`;
      runInBackground(c, "email.diagnostic_result", () =>
        sendEmail({
          to: submission.lead.email,
          tag: "diagnostic-result",
          ...renderResultEmail(result, resultUrl),
        }),
      );

      c.header("Location", `/api/results/${result.resultId}`);
      return c.json(result, 201);
    },
  )
  // The result id is an unguessable UUID that only the submitter receives; the payload carries
  // no contact data, so sharing or refreshing the result page is safe.
  .get("/results/:id", validate("param", resultParam), async (c) => {
    const lead = await getLeadWithAnswers(c.req.valid("param").id);
    if (!lead) return fail(c, 404, "RESULT_NOT_FOUND", "Resultado não encontrado");
    c.header("Cache-Control", "private, no-store");
    return c.json(toSubmissionResult(lead));
  });
