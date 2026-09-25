import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { fail } from "../core/http";
import type { AppEnv } from "../core/types";
import { SESSION_COOKIE, verifySession } from "../modules/auth/session";

/** The real admin guard: every /api/admin/* request is checked here, regardless of the UI. */
export const requireAdmin = createMiddleware<AppEnv>(async (c, next) => {
  const admin = await verifySession(getCookie(c, SESSION_COOKIE));
  if (!admin) return fail(c, 401, "UNAUTHENTICATED", "Faça login para continuar");
  c.set("admin", admin);
  await next();
});
