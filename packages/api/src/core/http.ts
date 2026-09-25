import type { ApiErrorCode, ApiErrorPayload } from "@enem-quiz/shared/validators";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { validator } from "hono/validator";
import type { z } from "zod";

export function fail(
  c: Context,
  status: ContentfulStatusCode,
  code: ApiErrorCode,
  message: string,
  fields?: Record<string, string>,
) {
  const body: ApiErrorPayload = { error: { code, message, ...(fields && { fields }) } };
  return c.json(body, status);
}

export function issuesToFields(issues: z.core.$ZodIssue[]): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path.join(".") || "_";
    fields[key] ??= issue.message;
  }
  return fields;
}

/** zod validation for any request target; failures become a 400 VALIDATION with field messages. */
export function validate<T extends z.ZodType, Target extends "json" | "query" | "param">(
  target: Target,
  schema: T,
) {
  return validator(target, async (value, c) => {
    const result = await schema.safeParseAsync(value);
    if (!result.success) {
      return fail(c, 400, "VALIDATION", "Dados inválidos", issuesToFields(result.error.issues));
    }
    return result.data as z.output<T>;
  });
}
