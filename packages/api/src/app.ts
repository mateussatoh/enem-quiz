import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { fail } from "./core/http";
import { logEvent } from "./core/logger";
import type { AppEnv } from "./core/types";
import { requestLogger } from "./middlewares/request-logger";
import { requireAdmin } from "./middlewares/require-admin";
import { authRoutes } from "./modules/auth/routes";
import { leadAdminRoutes } from "./modules/lead/admin-routes";
import { leadRoutes } from "./modules/lead/routes";
import { quizRoutes } from "./modules/quiz/routes";

/**
 * The REST API. Framework agnostic: Next mounts it at app/api/[[...route]], but the same
 * `app.fetch` runs on Node, Lambda or Workers unchanged.
 */
export const app = new Hono<AppEnv>().basePath("/api");

app.use(secureHeaders());
app.use(requestLogger);

app.get("/health", (c) => c.json({ ok: true }));
app.route("/", quizRoutes);
app.route("/", leadRoutes);
app.route("/auth", authRoutes);

app.use("/admin/*", requireAdmin);
app.route("/admin", leadAdminRoutes);

app.notFound((c) => fail(c, 404, "NOT_FOUND", "Rota não encontrada"));

app.onError((err, c) => {
  logEvent("error", "http.unhandled", { path: c.req.path, message: err.message, stack: err.stack });
  return fail(c, 500, "INTERNAL", "Erro inesperado. Tente novamente");
});

export type App = typeof app;
