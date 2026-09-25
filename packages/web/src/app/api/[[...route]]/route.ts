import { app } from "@enem-quiz/api/app";

// The REST API lives in packages/api (Hono). Next only hosts it: this file is the whole bridge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = (req: Request) => app.fetch(req);

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE };
