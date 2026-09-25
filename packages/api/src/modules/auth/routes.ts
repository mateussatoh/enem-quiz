import { loginSchema } from "@enem-quiz/shared/validators";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { env } from "../../core/env";
import { fail, validate } from "../../core/http";
import { logEvent } from "../../core/logger";
import { authenticate } from "./service";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, signSession, verifySession } from "./session";

export const authRoutes = new Hono()
  .post("/login", validate("json", loginSchema), async (c) => {
    const { email, password } = c.req.valid("json");
    const admin = await authenticate(email, password);
    if (!admin) {
      logEvent("warn", "auth.login_failed", {});
      return fail(c, 401, "INVALID_CREDENTIALS", "E-mail ou senha incorretos");
    }

    setCookie(c, SESSION_COOKIE, await signSession(admin), {
      httpOnly: true,
      secure: env().NODE_ENV === "production",
      sameSite: "Lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
    logEvent("info", "auth.login", { adminId: admin.id });
    return c.json(admin);
  })
  .post("/logout", (c) => {
    deleteCookie(c, SESSION_COOKIE, { path: "/" });
    return c.body(null, 204);
  })
  .get("/me", async (c) => {
    const admin = await verifySession(getCookie(c, SESSION_COOKIE));
    if (!admin) return fail(c, 401, "UNAUTHENTICATED", "Sessão expirada. Entre novamente");
    return c.json(admin);
  });
