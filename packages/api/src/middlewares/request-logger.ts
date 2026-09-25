import { createMiddleware } from "hono/factory";
import { logEvent } from "../core/logger";

export const requestLogger = createMiddleware(async (c, next) => {
  const start = performance.now();
  await next();
  logEvent("info", "http.request", {
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    ms: Math.round(performance.now() - start),
  });
});
