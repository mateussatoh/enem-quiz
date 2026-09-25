import { z } from "zod";
import { normalizeBrazilianPhone } from "../utils/phone";

export const NAME_MIN = 3;
export const NAME_MAX = 120;

export const leadNameSchema = z
  .string({ error: "Informe seu nome" })
  .overwrite((v) => v.trim().replace(/\s+/g, " "))
  .min(NAME_MIN, { error: `O nome precisa ter pelo menos ${NAME_MIN} caracteres` })
  .max(NAME_MAX, { error: "Nome muito longo" })
  .refine((v: string) => /\p{L}/u.test(v), { error: "Informe um nome válido" });

export const leadEmailSchema = z
  .string({ error: "Informe seu e-mail" })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "E-mail inválido" }).max(254, { error: "E-mail muito longo" }));

/** Output is national digits (DDD + number), e.g. "11987654321". */
export const leadPhoneSchema = z.string({ error: "Informe seu telefone" }).transform((v, ctx) => {
  const normalized = normalizeBrazilianPhone(v);
  if (!normalized) {
    ctx.addIssue({ code: "custom", message: "Telefone inválido. Use DDD + número" });
    return z.NEVER;
  }
  return normalized;
});

export const leadSchema = z.object({
  name: leadNameSchema,
  email: leadEmailSchema,
  phone: leadPhoneSchema,
});

export type LeadInput = z.input<typeof leadSchema>;
export type Lead = z.output<typeof leadSchema>;
