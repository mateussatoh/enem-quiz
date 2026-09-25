import { submissionSchema } from "@enem-quiz/shared/validators";
import { Hono, type Context } from "hono";
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
import {
  claimResultEmail,
  createLead,
  DUPLICATE_WINDOW_HOURS,
  getLeadWithAnswers,
} from "./service";

const resultParam = z.object({ id: z.uuid() });

/** Sends the diagnostic e-mail after the response, at most once per throttle window. */
function emailResult(c: Context, leadId: string, baseUrl: string) {
  runInBackground(c, "email.diagnostic_result", async () => {
    if (!(await claimResultEmail(leadId))) return;
    const lead = await getLeadWithAnswers(leadId);
    if (!lead) return;
    const result = toSubmissionResult(lead);
    await sendEmail({
      to: lead.email,
      tag: "diagnostic-result",
      ...renderResultEmail(result, `${baseUrl}/resultado/${result.resultId}`),
    });
  });
}

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

      const baseUrl = env().APP_URL ?? new URL(c.req.url).origin;

      if (!created.ok) {
        logEvent("warn", `submission.${created.reason.toLowerCase()}`, { quiz: quiz.slug });
        if (created.reason === "RATE_LIMITED") {
          return fail(
            c,
            429,
            "RATE_LIMITED",
            "Muitos envios em pouco tempo. Tente novamente em alguns minutos",
          );
        }
        // Never reveal the earlier result in the response (anyone can type any e-mail); send it
        // to the inbox that owns the address instead, so the student still has a way forward.
        emailResult(c, created.existingLeadId, baseUrl);
        return fail(
          c,
          409,
          "DUPLICATE_LEAD",
          `Você já fez o diagnóstico com este e-mail nas últimas ${DUPLICATE_WINDOW_HOURS} horas. Enviamos o resultado para a sua caixa de entrada`,
        );
      }

      logEvent("info", "submission.created", { leadId: created.lead.id, score: scored.score });
      const result = toSubmissionResult((await getLeadWithAnswers(created.lead.id))!);

      // The student sees the result right away; the e-mail copy goes out after the response.
      emailResult(c, result.resultId, baseUrl);

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
