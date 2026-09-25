import "server-only";
import { SESSION_COOKIE, verifySession } from "@enem-quiz/api/session";
import { cookies } from "next/headers";

/**
 * Page-level gate for admin screens (UX: redirect instead of rendering an empty shell).
 * The authoritative check is the API's requireAdmin middleware on every /api/admin request.
 */
export async function getAdminSession() {
  const store = await cookies();
  return verifySession(store.get(SESSION_COOKIE)?.value);
}
