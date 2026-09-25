import { leadFiltersSchema, leadListQuerySchema } from "@enem-quiz/shared/validators";
import type { LeadStats, Paginated, LeadListItem } from "@enem-quiz/shared/types";
import { Hono } from "hono";
import { z } from "zod";
import { fail, validate } from "../../core/http";
import type { AppEnv } from "../../core/types";
import { leadsToCsv } from "./csv";
import { toLeadDetail, toLeadListItem } from "./serialize";
import { getLeadStats, getLeadWithAnswers, listLeads, listLeadsForExport } from "./service";

const idParam = z.object({ id: z.uuid() });

export const leadAdminRoutes = new Hono<AppEnv>()
  .get("/leads", validate("query", leadListQuerySchema), async (c) => {
    const query = c.req.valid("query");
    const { items, total } = await listLeads(query);
    const body: Paginated<LeadListItem> = {
      items: items.map(toLeadListItem),
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    };
    return c.json(body);
  })
  .get("/leads/export.csv", validate("query", leadFiltersSchema), async (c) => {
    const rows = await listLeadsForExport(c.req.valid("query"));
    const stamp = new Date().toISOString().slice(0, 10);
    c.header("Content-Type", "text/csv; charset=utf-8");
    c.header("Content-Disposition", `attachment; filename="leads-${stamp}.csv"`);
    return c.body(leadsToCsv(rows));
  })
  .get("/leads/:id", validate("param", idParam), async (c) => {
    const lead = await getLeadWithAnswers(c.req.valid("param").id);
    if (!lead) return fail(c, 404, "LEAD_NOT_FOUND", "Lead não encontrado");
    return c.json(toLeadDetail(lead));
  })
  .get("/stats", async (c) => {
    const stats: LeadStats = await getLeadStats();
    return c.json(stats);
  });
