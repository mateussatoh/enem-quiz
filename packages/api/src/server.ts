import { serve } from "@hono/node-server";
import { loadRootEnv } from "./core/load-env";
import { logEvent } from "./core/logger";

loadRootEnv();

// Standalone Node entrypoint: the same app Next mounts, served on its own port. Proves the API
// has no dependency on the web app and is the starting point for deploying it separately.
const { app } = await import("./app");
const port = Number(process.env.API_PORT ?? 4000);

serve({ fetch: app.fetch, port }, (info) => {
  logEvent("info", "api.listening", { url: `http://localhost:${info.port}/api` });
});
