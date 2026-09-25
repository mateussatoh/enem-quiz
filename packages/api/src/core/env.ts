import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  SESSION_SECRET: z.string().min(32, { error: "SESSION_SECRET precisa ter 32+ caracteres" }),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type Env = z.output<typeof envSchema>;

let cached: Env | undefined;

/** Parsed lazily so importing the app never crashes a build step that lacks runtime secrets. */
export function env(): Env {
  cached ??= envSchema.parse(process.env);
  return cached;
}
