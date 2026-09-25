import { z } from "zod";
import { BAND_KEYS } from "../domain/bands";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email({ error: "E-mail inválido" })),
  password: z.string().min(1, { error: "Informe a senha" }).max(200),
});
export type LoginInput = z.input<typeof loginSchema>;

export const leadFiltersSchema = z.object({
  q: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => v || undefined),
  band: z.enum(BAND_KEYS).optional(),
});

export const leadListQuerySchema = leadFiltersSchema.extend({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
export type LeadListQuery = z.output<typeof leadListQuerySchema>;
export type LeadFilters = z.output<typeof leadFiltersSchema>;
