"use client";

import { BAND_KEYS, BANDS, type BandKey } from "@enem-quiz/shared/domain";
import type { LeadListItem } from "@enem-quiz/shared/types";
import { formatPhone } from "@enem-quiz/shared/utils";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Download, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BandBadge } from "@/components/common/band-badge";
import { EmptyState, ErrorState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebouncedValue } from "@/lib/use-debounced-value";
import { cn, formatDateTime } from "@/lib/utils";
import { adminKeys, exportUrl, fetchLeads, type LeadFiltersState } from "../api";
import { PageHeader } from "./admin-shell";
import { LeadDrawer } from "./lead-drawer";

const isBand = (v: string | null): v is BandKey => BAND_KEYS.includes(v as BandKey);

/** Filters live in the URL (?q=&faixa=&pagina=) so a filtered list can be shared or refreshed. */
function useUrlFilters(): [LeadFiltersState, (next: Partial<LeadFiltersState>) => void] {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const band = params.get("faixa");
  const filters: LeadFiltersState = {
    q: params.get("q") ?? "",
    band: isBand(band) ? band : "",
    page: Math.max(1, Number(params.get("pagina")) || 1),
  };

  const update = (next: Partial<LeadFiltersState>) => {
    const merged = { ...filters, page: 1, ...next };
    const qs = new URLSearchParams();
    if (merged.q) qs.set("q", merged.q);
    if (merged.band) qs.set("faixa", merged.band);
    if (merged.page > 1) qs.set("pagina", String(merged.page));
    router.replace(`${pathname}${qs.size ? `?${qs}` : ""}` as "/admin/leads", { scroll: false });
  };
  return [filters, update];
}

export function LeadsView() {
  const [filters, setFilters] = useUrlFilters();
  const [search, setSearch] = useState(filters.q);
  const debouncedSearch = useDebouncedValue(search);
  const [openLeadId, setOpenLeadId] = useState<string | null>(null);

  useEffect(() => {
    if (debouncedSearch.trim() !== filters.q) setFilters({ q: debouncedSearch.trim() });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the debounced input
  }, [debouncedSearch]);

  const query = useQuery({
    queryKey: adminKeys.leads(filters),
    queryFn: () => fetchLeads(filters),
    placeholderData: keepPreviousData,
  });
  const data = query.data;
  const hasFilters = !!filters.q || !!filters.band;

  return (
    <>
      <PageHeader
        title="Leads"
        description={
          data ? `${data.total} ${data.total === 1 ? "lead encontrado" : "leads encontrados"}` : " "
        }
        actions={
          <Button asChild variant="outline">
            <a href={exportUrl(filters)} download>
              <Download /> Exportar CSV
            </a>
          </Button>
        }
      />

      <div className="mb-4 flex flex-col gap-3">
        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-subtle"
            aria-hidden
          />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou e-mail"
            aria-label="Buscar por nome ou e-mail"
            className="h-11 pl-10"
          />
        </div>
        <div
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
          role="group"
          aria-label="Filtrar por faixa"
        >
          <FilterPill active={!filters.band} onClick={() => setFilters({ band: "" })}>
            Todas as faixas
          </FilterPill>
          {BANDS.map((b) => (
            <FilterPill
              key={b.key}
              active={filters.band === b.key}
              onClick={() => setFilters({ band: b.key })}
            >
              {b.label}
            </FilterPill>
          ))}
        </div>
      </div>

      <Card
        className={cn(
          "overflow-hidden transition-opacity",
          query.isPlaceholderData && "opacity-60",
        )}
      >
        {query.isError ? (
          <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
        ) : !data ? (
          <TableSkeleton />
        ) : data.items.length === 0 ? (
          <EmptyState
            title={hasFilters ? "Nenhum lead com esses filtros" : "Nenhum lead ainda"}
            description={
              hasFilters
                ? "Tente outro termo ou limpe os filtros."
                : "Assim que alguém concluir o quiz, o lead aparece aqui."
            }
            action={
              hasFilters && (
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setSearch("");
                    setFilters({ q: "", band: "" });
                  }}
                >
                  Limpar filtros
                </Button>
              )
            }
          />
        ) : (
          <>
            <LeadsTable items={data.items} onOpen={setOpenLeadId} />
            <LeadsList items={data.items} onOpen={setOpenLeadId} />
          </>
        )}
      </Card>

      {data && data.totalPages > 1 && (
        <nav className="mt-4 flex items-center justify-between gap-3" aria-label="Paginação">
          <p className="text-sm text-subtle tabular-nums">
            Página {data.page} de {data.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={data.page <= 1}
              onClick={() => setFilters({ page: data.page - 1 })}
            >
              <ChevronLeft /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={data.page >= data.totalPages}
              onClick={() => setFilters({ page: data.page + 1 })}
            >
              Próxima <ChevronRight />
            </Button>
          </div>
        </nav>
      )}

      <LeadDrawer leadId={openLeadId} onClose={() => setOpenLeadId(null)} />
    </>
  );
}

function FilterPill({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "h-9 shrink-0 rounded-full border px-4 text-sm font-medium whitespace-nowrap transition outline-none focus-visible:ring-[3px] focus-visible:ring-brand-line",
        active
          ? "border-brand bg-brand text-white"
          : "bg-surface-card text-ink-soft hover:bg-surface-tint",
      )}
    >
      {children}
    </button>
  );
}

type ListProps = { items: LeadListItem[]; onOpen: (id: string) => void };

function LeadsTable({ items, onOpen }: ListProps) {
  return (
    <table className="hidden w-full text-sm md:table">
      <thead className="border-b bg-surface-page/60 text-left text-xs tracking-wide text-subtle uppercase">
        <tr>
          <th className="px-5 py-3 font-medium">Nome</th>
          <th className="px-5 py-3 font-medium">Contato</th>
          <th className="px-5 py-3 text-right font-medium">Pontuação</th>
          <th className="px-5 py-3 font-medium">Faixa</th>
          <th className="px-5 py-3 font-medium">Cadastro</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {items.map((lead) => (
          <tr
            key={lead.id}
            tabIndex={0}
            onClick={() => onOpen(lead.id)}
            onKeyDown={(e) =>
              (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen(lead.id))
            }
            className="cursor-pointer transition-colors outline-none hover:bg-surface-page focus-visible:bg-brand-soft/50"
            aria-label={`Ver respostas de ${lead.name}`}
          >
            <td className="px-5 py-3.5 font-medium text-ink">{lead.name}</td>
            <td className="px-5 py-3.5">
              <div className="text-ink-soft">{lead.email}</div>
              <div className="text-xs text-subtle tabular-nums">{formatPhone(lead.phone)}</div>
            </td>
            <td className="px-5 py-3.5 text-right font-serif text-xl tabular-nums">{lead.score}</td>
            <td className="px-5 py-3.5">
              <BandBadge band={lead.band} />
            </td>
            <td className="px-5 py-3.5 text-ink-soft tabular-nums">
              {formatDateTime(lead.createdAt)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function LeadsList({ items, onOpen }: ListProps) {
  return (
    <ul className="divide-y md:hidden">
      {items.map((lead) => (
        <li key={lead.id}>
          <button
            type="button"
            onClick={() => onOpen(lead.id)}
            className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors hover:bg-surface-page"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-ink">{lead.name}</p>
              <p className="truncate text-sm text-subtle">{lead.email}</p>
              <p className="text-sm text-subtle tabular-nums">{formatPhone(lead.phone)}</p>
              <div className="mt-2 flex items-center gap-2">
                <BandBadge band={lead.band} />
                <span className="text-xs text-subtle tabular-nums">
                  {formatDateTime(lead.createdAt)}
                </span>
              </div>
            </div>
            <span className="font-serif text-3xl tabular-nums">{lead.score}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

function TableSkeleton() {
  return (
    <div className="flex flex-col divide-y" role="status" aria-label="Carregando leads">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="ml-auto h-6 w-10" />
        </div>
      ))}
    </div>
  );
}
