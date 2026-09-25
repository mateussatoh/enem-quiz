import type { AdminSession } from "@enem-quiz/shared/types";
import { jwtVerify, SignJWT } from "jose";

// Standalone on purpose (no db/env imports): the web proxy imports it to gate admin pages.

export const SESSION_COOKIE = "quiz_admin_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8;
const ISSUER = "enem-quiz";

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET must have 32+ characters");
  return new TextEncoder().encode(secret);
}

export async function signSession(admin: AdminSession): Promise<string> {
  return new SignJWT({ email: admin.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(admin.id))
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined): Promise<AdminSession | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), {
      issuer: ISSUER,
      algorithms: ["HS256"],
    });
    if (!payload.sub || typeof payload.email !== "string") return null;
    return { id: Number(payload.sub), email: payload.email };
  } catch {
    return null;
  }
}
