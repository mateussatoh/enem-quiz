import type { AdminSession } from "@enem-quiz/shared/types";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../../core/crypto";
import { db } from "../../core/db";
import { adminUsers } from "./schema";

// Verified against when the e-mail is unknown, so response time does not reveal which
// e-mails exist.
const dummyHash = hashPassword("timing-equalizer");

export async function authenticate(email: string, password: string): Promise<AdminSession | null> {
  const user = await db().query.adminUsers.findFirst({ where: eq(adminUsers.email, email) });
  const valid = await verifyPassword(password, user?.passwordHash ?? (await dummyHash));
  return user && valid ? { id: user.id, email: user.email } : null;
}
