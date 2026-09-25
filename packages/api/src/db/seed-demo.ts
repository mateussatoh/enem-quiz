import { loadRootEnv } from "../core/load-env";
import { QUIZ_SLUG } from "./quiz-content";

loadRootEnv();

const { closeDb, db } = await import("../core/db");
const { getActiveQuizBySlug } = await import("../modules/quiz/service");
const { scoreSubmission } = await import("../modules/lead/scoring");
const { leadAnswers, leads } = await import("./schema");

const FIRST = [
  "Ana",
  "Bruno",
  "Carla",
  "Diego",
  "Elisa",
  "Felipe",
  "Gabriela",
  "Henrique",
  "Isabela",
  "João",
  "Larissa",
  "Mateus",
  "Natália",
  "Otávio",
  "Paula",
  "Rafael",
  "Sofia",
  "Thiago",
  "Vitória",
  "Yuri",
];
const LAST = [
  "Silva",
  "Santos",
  "Oliveira",
  "Souza",
  "Lima",
  "Pereira",
  "Costa",
  "Almeida",
  "Ribeiro",
  "Carvalho",
];
const DDDS = ["11", "21", "31", "41", "51", "61", "71", "81", "85", "92"];

const pick = <T>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)]!;

/** Fake leads spread over the last 30 days so the admin has something to show. Demo only. */
async function seedDemo(count: number) {
  const quiz = await getActiveQuizBySlug(QUIZ_SLUG);
  if (!quiz) throw new Error("Quiz not found. Run pnpm db:seed first.");

  // Each fake student has a "level" so scores spread over every band instead of clustering.
  for (let i = 0; i < count; i++) {
    const level = Math.random();
    const answers = quiz.questions.map((q) => {
      const idx = Math.min(
        q.options.length - 1,
        Math.floor((level * 0.8 + Math.random() * 0.4) * q.options.length),
      );
      return { questionId: q.id, optionId: q.options[idx]!.id };
    });
    const scored = scoreSubmission(quiz, answers);
    if (!scored.ok) throw new Error(scored.reason);

    const first = pick(FIRST);
    const last = pick(LAST);
    const createdAt = new Date(Date.now() - Math.random() ** 1.6 * 30 * 86_400_000);

    await db().transaction(async (tx) => {
      const [lead] = await tx
        .insert(leads)
        .values({
          quizId: quiz.id,
          name: `${first} ${last}`,
          email: `${first}.${last}.${i}@exemplo.com`
            .normalize("NFD")
            .replace(/[̀-ͯ]/g, "")
            .toLowerCase(),
          phone: `${pick(DDDS)}9${String(Math.floor(Math.random() * 1e8)).padStart(8, "0")}`,
          score: scored.score,
          band: scored.band.key,
          createdAt,
        })
        .returning({ id: leads.id });
      await tx.insert(leadAnswers).values(scored.answers.map((a) => ({ leadId: lead!.id, ...a })));
    });
  }
}

const count = Number(process.argv[2] ?? 60);
await seedDemo(count);
console.log(`${count} leads de demonstração criados.`);
await closeDb();
