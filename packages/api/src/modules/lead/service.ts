import { BANDS, type BandKey } from "@enem-quiz/shared/domain";
import type { Lead, LeadFilters, LeadListQuery } from "@enem-quiz/shared/validators";
import { and, asc, count, desc, eq, gte, ilike, or, sql, type SQL } from "drizzle-orm";
import { db } from "../../core/db";
import { env } from "../../core/env";
import type { ScoredAnswer } from "./scoring";
import { leadAnswers, leads } from "./schema";

export const DUPLICATE_WINDOW_HOURS = 24;
export const RATE_LIMIT_WINDOW_MINUTES = 10;
export const EXPORT_LIMIT = 10_000;

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000);

export type CreateLeadInput = {
  quizId: number;
  lead: Lead;
  score: number;
  band: BandKey;
  answers: ScoredAnswer[];
  ipHash: string | null;
};

export type CreateLeadResult =
  | { ok: true; lead: typeof leads.$inferSelect }
  | { ok: false; reason: "DUPLICATE_LEAD" | "RATE_LIMITED" };

/**
 * Persists the lead and its answer snapshot atomically. An advisory lock on the e-mail makes
 * the duplicate check race free (two fast clicks cannot both pass it).
 */
export async function createLead(input: CreateLeadInput): Promise<CreateLeadResult> {
  return db().transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${input.lead.email}))`);

    if (input.ipHash) {
      const [recent] = await tx
        .select({ n: count() })
        .from(leads)
        .where(
          and(
            eq(leads.ipHash, input.ipHash),
            gte(leads.createdAt, minutesAgo(RATE_LIMIT_WINDOW_MINUTES)),
          ),
        );
      if ((recent?.n ?? 0) >= env().SUBMISSION_RATE_LIMIT)
        return { ok: false, reason: "RATE_LIMITED" };
    }

    const duplicate = await tx
      .select({ id: leads.id })
      .from(leads)
      .where(
        and(
          eq(leads.quizId, input.quizId),
          eq(leads.email, input.lead.email),
          gte(leads.createdAt, minutesAgo(DUPLICATE_WINDOW_HOURS * 60)),
        ),
      )
      .limit(1);
    if (duplicate.length) return { ok: false, reason: "DUPLICATE_LEAD" };

    const [lead] = await tx
      .insert(leads)
      .values({
        quizId: input.quizId,
        ...input.lead,
        score: input.score,
        band: input.band,
        ipHash: input.ipHash,
      })
      .returning();

    await tx.insert(leadAnswers).values(input.answers.map((a) => ({ leadId: lead!.id, ...a })));
    return { ok: true, lead: lead! };
  });
}

export async function getLeadWithAnswers(id: string) {
  const lead = await db().query.leads.findFirst({
    where: eq(leads.id, id),
    with: {
      answers: { orderBy: asc(leadAnswers.position) },
      quiz: { columns: { slug: true, title: true } },
    },
  });
  return lead ?? null;
}

export type LeadWithAnswers = NonNullable<Awaited<ReturnType<typeof getLeadWithAnswers>>>;

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (ch) => `\\${ch}`);
}

function filtersToWhere({ q, band }: LeadFilters): SQL | undefined {
  const conditions: SQL[] = [];
  if (q) {
    const pattern = `%${escapeLike(q)}%`;
    conditions.push(or(ilike(leads.name, pattern), ilike(leads.email, pattern))!);
  }
  if (band) conditions.push(eq(leads.band, band));
  return conditions.length ? and(...conditions) : undefined;
}

export async function listLeads(query: LeadListQuery) {
  const where = filtersToWhere(query);
  const [items, [totals]] = await Promise.all([
    db()
      .select()
      .from(leads)
      .where(where)
      .orderBy(desc(leads.createdAt), desc(leads.id))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize),
    db().select({ total: count() }).from(leads).where(where),
  ]);
  return { items, total: totals?.total ?? 0 };
}

export async function listLeadsForExport(filters: LeadFilters) {
  return db()
    .select()
    .from(leads)
    .where(filtersToWhere(filters))
    .orderBy(desc(leads.createdAt))
    .limit(EXPORT_LIMIT);
}

const STATS_DAYS = 30;

export async function getLeadStats() {
  // Days are bucketed in Brasília time so "today" matches what the sales team sees.
  const localDay = sql`(${leads.createdAt} at time zone 'America/Sao_Paulo')::date`;

  const [[summary], bandRows, dayRows] = await Promise.all([
    db()
      .select({
        total: count(),
        last7Days: count(sql`case when ${leads.createdAt} >= now() - interval '7 days' then 1 end`),
        averageScore: sql<string | null>`round(avg(${leads.score}))`,
      })
      .from(leads),
    db().select({ band: leads.band, count: count() }).from(leads).groupBy(leads.band),
    // generate_series fills quiet days with zero so charts never skip a date.
    db().execute<{ date: string; count: number }>(sql`
      with days as (
        select generate_series(
          (now() at time zone 'America/Sao_Paulo')::date - ${sql.raw(String(STATS_DAYS - 1))},
          (now() at time zone 'America/Sao_Paulo')::date,
          interval '1 day'
        )::date as day
      )
      select days.day::text as date, count(${leads.id})::int as count
      from days
      left join ${leads} on ${localDay} = days.day
      group by days.day
      order by days.day
    `),
  ]);

  const perBand = new Map(bandRows.map((r) => [r.band, r.count]));

  return {
    total: summary?.total ?? 0,
    last7Days: summary?.last7Days ?? 0,
    averageScore: summary?.averageScore == null ? null : Number(summary.averageScore),
    byBand: BANDS.map((b) => ({ key: b.key, label: b.label, count: perBand.get(b.key) ?? 0 })),
    byDay: dayRows.map((r) => ({ date: r.date, count: Number(r.count) })),
  };
}
