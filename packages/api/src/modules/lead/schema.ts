import { BAND_KEYS } from "@enem-quiz/shared/domain";
import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { options, questions, quizzes } from "../quiz/schema";

export const bandKey = pgEnum("band_key", BAND_KEYS);

export const leads = pgTable(
  "leads",
  {
    id: uuid().primaryKey().defaultRandom(),
    quizId: integer()
      .notNull()
      .references(() => quizzes.id),
    name: text().notNull(),
    /** Stored lowercased by the validator, so equality and ilike stay index friendly. */
    email: text().notNull(),
    /** National digits: DDD + number. */
    phone: text().notNull(),
    score: smallint().notNull(),
    band: bandKey().notNull(),
    ipHash: text(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index().on(t.createdAt.desc()),
    index().on(t.band, t.createdAt.desc()),
    index().on(t.email, t.createdAt.desc()),
    index().on(t.ipHash, t.createdAt.desc()),
    check("leads_score_range", sql`${t.score} between 0 and 100`),
  ],
);

/**
 * One row per answered question. Question text, option label and weight are snapshotted so a
 * lead's history never changes when marketing edits the quiz later. The FKs stay nullable
 * (set null) for the same reason: deleting content must not delete what a lead answered.
 */
export const leadAnswers = pgTable(
  "lead_answers",
  {
    leadId: uuid()
      .notNull()
      .references(() => leads.id, { onDelete: "cascade" }),
    position: smallint().notNull(),
    questionId: integer().references(() => questions.id, { onDelete: "set null" }),
    optionId: integer().references(() => options.id, { onDelete: "set null" }),
    questionText: text().notNull(),
    optionLabel: text().notNull(),
    weight: smallint().notNull(),
  },
  (t) => [primaryKey({ columns: [t.leadId, t.position] })],
);

export const leadsRelations = relations(leads, ({ one, many }) => ({
  quiz: one(quizzes, { fields: [leads.quizId], references: [quizzes.id] }),
  answers: many(leadAnswers),
}));
export const leadAnswersRelations = relations(leadAnswers, ({ one }) => ({
  lead: one(leads, { fields: [leadAnswers.leadId], references: [leads.id] }),
}));
