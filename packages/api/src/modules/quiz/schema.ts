import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const quizzes = pgTable("quizzes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  slug: text().notNull().unique(),
  title: text().notNull(),
  subtitle: text(),
  isActive: boolean().notNull().default(true),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const questions = pgTable(
  "questions",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    quizId: integer()
      .notNull()
      .references(() => quizzes.id, { onDelete: "cascade" }),
    position: smallint().notNull(),
    text: text().notNull(),
  },
  (t) => [unique().on(t.quizId, t.position)],
);

export const options = pgTable(
  "options",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    questionId: integer()
      .notNull()
      .references(() => questions.id, { onDelete: "cascade" }),
    position: smallint().notNull(),
    label: text().notNull(),
    weight: smallint().notNull(),
  },
  (t) => [
    unique().on(t.questionId, t.position),
    check("options_weight_range", sql`${t.weight} between 0 and 12`),
  ],
);

export const quizzesRelations = relations(quizzes, ({ many }) => ({ questions: many(questions) }));
export const questionsRelations = relations(questions, ({ one, many }) => ({
  quiz: one(quizzes, { fields: [questions.quizId], references: [quizzes.id] }),
  options: many(options),
}));
export const optionsRelations = relations(options, ({ one }) => ({
  question: one(questions, { fields: [options.questionId], references: [questions.id] }),
}));
