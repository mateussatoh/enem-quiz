import type { BandKey } from "@enem-quiz/shared/domain";
import type {
  AdminSession,
  LeadDetail,
  LeadListItem,
  LeadStats,
  Paginated,
} from "@enem-quiz/shared/types";
import type { LoginInput } from "@enem-quiz/shared/validators";
import { api, isApiError } from "@/lib/http";

export type LeadFiltersState = { q: string; band: BandKey | ""; page: number };

export const adminKeys = {
  all: ["admin"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  leads: (f: LeadFiltersState) => [...adminKeys.all, "leads", f] as const,
  lead: (id: string) => [...adminKeys.all, "lead", id] as const,
};

/** Admin calls: an expired session sends the user back to login instead of a dead screen. */
async function adminApi<T>(path: string, init?: Parameters<typeof api>[1]): Promise<T> {
  try {
    return await api<T>(path, init);
  } catch (error) {
    if (isApiError(error) && error.status === 401 && typeof window !== "undefined") {
      window.location.assign("/admin/login?expirou=1");
    }
    throw error;
  }
}

function filtersToQuery({ q, band }: Pick<LeadFiltersState, "q" | "band">) {
  const params = new URLSearchParams();
  if (q.trim()) params.set("q", q.trim());
  if (band) params.set("band", band);
  return params;
}

export const login = (body: LoginInput) =>
  api<AdminSession>("/auth/login", { method: "POST", json: body });
export const logout = () => api<void>("/auth/logout", { method: "POST" });

export const fetchStats = () => adminApi<LeadStats>("/admin/stats");

export function fetchLeads(filters: LeadFiltersState, pageSize = 20) {
  const params = filtersToQuery(filters);
  params.set("page", String(filters.page));
  params.set("pageSize", String(pageSize));
  return adminApi<Paginated<LeadListItem>>(`/admin/leads?${params}`);
}

export const fetchLead = (id: string) => adminApi<LeadDetail>(`/admin/leads/${id}`);

export function exportUrl(filters: Pick<LeadFiltersState, "q" | "band">) {
  const params = filtersToQuery(filters).toString();
  return `/api/admin/leads/export.csv${params ? `?${params}` : ""}`;
}
