import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  SESSION_SECRET: z.string().min(32, { error: "SESSION_SECRET precisa ter 32+ caracteres" }),
  /**
   * Max new leads per IP in a 10 minute window. 20 stops scripted abuse while leaving room for
   * a school or office sharing one public IP.
   */
  SUBMISSION_RATE_LIMIT: z.coerce.number().int().positive().default(20),
  /** Optional: without it, result e-mails are skipped (logged), so local setup needs no account. */
  RESEND_API_KEY: z
    .string()
    .optional()
    .transform((v) => v || undefined),
  EMAIL_FROM: z.string().default("Diagnóstico ENEM <onboarding@resend.dev>"),
  /** Public base URL for links in e-mails. Defaults to the request origin. */
  APP_URL: z
    .url()
    .optional()
    .or(z.literal("").transform(() => undefined)),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.output<typeof envSchema>;

let cached: Env | undefined;

/** Parsed lazily so importing the app never crashes a build step that lacks runtime secrets. */
export function env(): Env {
  cached ??= envSchema.parse(process.env);
  return cached;
}
