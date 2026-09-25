import { eq } from "drizzle-orm";
import { loadRootEnv } from "../core/load-env";
import { quizContent } from "./quiz-content";

loadRootEnv();

const { closeDb, db } = await import("../core/db");
const { hashPassword } = await import("../core/crypto");
const { adminUsers, options, questions, quizzes } = await import("./schema");

/** Idempotent: creates the admin (or resets its password) and the quiz only if missing. */
export async function seed() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@assaad.dev").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "Assaad@2026";
  const passwordHash = await hashPassword(password);

  await db()
    .insert(adminUsers)
    .values({ email, passwordHash })
    .onConflictDoUpdate({ target: adminUsers.email, set: { passwordHash } });

  const existing = await db().query.quizzes.findFirst({
    where: eq(quizzes.slug, quizContent.slug),
  });
  if (existing) return { email, quizCreated: false };

  await db().transaction(async (tx) => {
    const [quiz] = await tx
      .insert(quizzes)
      .values({ slug: quizContent.slug, title: quizContent.title, subtitle: quizContent.subtitle })
      .returning({ id: quizzes.id });

    for (const [qIndex, q] of quizContent.questions.entries()) {
      const [question] = await tx
        .insert(questions)
        .values({ quizId: quiz!.id, position: qIndex + 1, text: q.text })
        .returning({ id: questions.id });
      await tx.insert(options).values(
        q.options.map(([label, weight], oIndex) => ({
          questionId: question!.id,
          position: oIndex + 1,
          label,
          weight,
        })),
      );
    }
  });
  return { email, quizCreated: true };
}

if (import.meta.main) {
  const result = await seed();
  console.log(`Admin: ${result.email}. Quiz ${result.quizCreated ? "criado" : "já existia"}.`);
  await closeDb();
}
