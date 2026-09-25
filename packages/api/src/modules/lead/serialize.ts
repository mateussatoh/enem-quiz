import { getBandByKey, type BandKey } from "@enem-quiz/shared/domain";
import type {
  AnswerSummary,
  BandDTO,
  LeadDetail,
  LeadListItem,
  SubmissionResult,
} from "@enem-quiz/shared/types";
import type { leads } from "./schema";
import type { LeadWithAnswers } from "./service";

type LeadRow = typeof leads.$inferSelect;

export function toBandDTO(key: BandKey): BandDTO {
  const { label, message } = getBandByKey(key);
  return { key, label, message };
}

const toAnswerSummary = (a: LeadWithAnswers["answers"][number]): AnswerSummary => ({
  position: a.position,
  question: a.questionText,
  answer: a.optionLabel,
});

/** Public result: no contact data, only the first name for a friendly greeting. */
export function toSubmissionResult(lead: LeadWithAnswers): SubmissionResult {
  return {
    resultId: lead.id,
    firstName: lead.name.split(" ")[0] ?? lead.name,
    score: lead.score,
    band: toBandDTO(lead.band),
    answers: lead.answers.map(toAnswerSummary),
  };
}

export function toLeadListItem(lead: LeadRow): LeadListItem {
  return {
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    score: lead.score,
    band: toBandDTO(lead.band),
    createdAt: lead.createdAt.toISOString(),
  };
}

export function toLeadDetail(lead: LeadWithAnswers): LeadDetail {
  return {
    ...toLeadListItem(lead),
    quiz: { slug: lead.quiz.slug, title: lead.quiz.title },
    answers: lead.answers.map((a) => ({ ...toAnswerSummary(a), weight: a.weight })),
  };
}
