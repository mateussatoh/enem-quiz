import type { Context } from "hono";

/** Client IP as reported by the platform proxy (Vercel sets x-forwarded-for / x-real-ip). */
export function clientIp(c: Context): string | null {
  const forwarded = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || c.req.header("x-real-ip") || null;
}
