import type { Context } from "hono";
import { env } from "./env";

type NodeBindings = { incoming?: { socket?: { remoteAddress?: string } } };

/**
 * Client IP for rate limiting. Forwarding headers are client-controlled, so they are trusted
 * only behind a proxy that sets them (Vercel, or TRUST_PROXY=true). Otherwise the socket address
 * from the Node adapter is used (standalone `pnpm dev:api`).
 */
export function clientIp(
  c: Context,
  trustProxy = process.env.VERCEL === "1" || env().TRUST_PROXY,
): string | null {
  if (trustProxy) {
    const forwarded = c.req.header("x-forwarded-for")?.split(",")[0]?.trim();
    return forwarded || c.req.header("x-real-ip") || null;
  }
  return (c.env as NodeBindings | undefined)?.incoming?.socket?.remoteAddress ?? null;
}
