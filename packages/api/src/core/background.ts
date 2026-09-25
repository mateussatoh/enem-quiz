import type { Context } from "hono";
import { logEvent } from "./logger";

/**
 * Runs work after the response is sent. The host provides `waitUntil` (Next's `after()` in
 * the route handler, Workers/Lambda adapters natively); without one (tests, plain Node) the
 * task simply runs detached.
 */
export function runInBackground(c: Context, name: string, task: () => Promise<unknown>) {
  const promise = task().catch((err: Error) =>
    logEvent("error", "background.failed", { task: name, message: err.message }),
  );
  try {
    c.executionCtx.waitUntil(promise);
  } catch {
    // No execution context available: the promise is already running.
  }
}
