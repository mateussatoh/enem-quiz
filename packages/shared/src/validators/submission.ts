import { z } from "zod";
import { leadSchema } from "./lead";

export const answerSchema = z.object({
  questionId: z.int().positive(),
  optionId: z.int().positive(),
});

export const submissionSchema = z.object({
  answers: z
    .array(answerSchema)
    .min(1, { error: "Responda o quiz antes de enviar" })
    .max(50)
    .refine((a) => new Set(a.map((x) => x.questionId)).size === a.length, {
      error: "Cada pergunta deve ter apenas uma resposta",
    }),
  lead: leadSchema,
  // Honeypot: real users never see this field, bots tend to fill every input.
  website: z.string().max(200).optional(),
});

export type SubmissionInput = z.input<typeof submissionSchema>;
export type Submission = z.output<typeof submissionSchema>;
