import { app } from "@enem-quiz/api/app";
import { after } from "next/server";

// The REST API lives in packages/api (Hono). Next only hosts it: this file is the whole bridge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Next's after() keeps the function alive for work scheduled past the response (result e-mails).
const executionCtx = {
  waitUntil: (promise: Promise<unknown>) => after(() => promise),
  passThroughOnException: () => {},
  props: {},
};

const handler = (req: Request) => app.fetch(req, undefined, executionCtx);

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
