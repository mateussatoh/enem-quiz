"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { bandStyles } from "@/components/common/band-badge";
import { ErrorState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { adminKeys, fetchStats } from "../api";
import { PageHeader } from "./admin-shell";

const shortDate = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
};

export function Dashboard() {
  const query = useQuery({ queryKey: adminKeys.stats(), queryFn: fetchStats });

  return (
    <>
      <PageHeader
        title="Visão geral"
        description="Como o quiz está performando."
        actions={
          <Button asChild variant="outline">
            <Link href="/admin/leads">
              Ver leads <ArrowRight />
            </Link>
          </Button>
        }
      />
      {query.isError ? (
        <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric label="Total de leads" value={query.data?.total} />
            <Metric label="Últimos 7 dias" value={query.data?.last7Days} />
            <Metric
              label="Pontuação média"
              value={query.data ? (query.data.averageScore ?? "–") : undefined}
            />
            <Metric
              label="Na reta final"
              value={query.data?.byBand.find((b) => b.key === "final_stretch")?.count}
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-5">
            <Card className="p-5 lg:col-span-3">
              <h2 className="font-medium">Leads por dia</h2>
              <p className="mb-4 text-sm text-subtle">Últimos 30 dias</p>
              {query.data ? (
                <div className="h-64">
                  <ResponsiveContainer>
                    <BarChart data={query.data.byDay} margin={{ left: -24, right: 4 }}>
                      <CartesianGrid vertical={false} stroke="var(--line)" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={shortDate}
                        tick={{ fontSize: 11, fill: "var(--subtle)" }}
                        tickLine={false}
                        axisLine={false}
                        interval="preserveStartEnd"
                        minTickGap={16}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "var(--subtle)" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "var(--surface-tint)" }}
                        labelFormatter={(v) => shortDate(String(v))}
                        formatter={(v) => [v, "Leads"]}
                        contentStyle={{
                          borderRadius: 10,
                          border: "1px solid var(--line)",
                          fontSize: 13,
                        }}
                      />
                      <Bar
                        dataKey="count"
                        fill="var(--brand)"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={24}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <Skeleton className="h-64" />
              )}
            </Card>

            <Card className="p-5 lg:col-span-2">
              <h2 className="font-medium">Distribuição por faixa</h2>
              <p className="mb-4 text-sm text-subtle">Todos os leads</p>
              {query.data ? (
                <ul className="flex flex-col gap-4">
                  {query.data.byBand.map((b) => {
                    const pct = query.data.total
                      ? Math.round((b.count / query.data.total) * 100)
                      : 0;
                    return (
                      <li key={b.key}>
                        <Link
                          href={{ pathname: "/admin/leads", query: { faixa: b.key } }}
                          className="group block rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-brand-line"
                        >
                          <div className="mb-1.5 flex justify-between text-sm">
                            <span className="text-ink-soft group-hover:text-ink">{b.label}</span>
                            <span className="text-subtle tabular-nums">
                              {b.count} · {pct}%
                            </span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-surface-tint">
                            <div
                              className="h-full rounded-full transition-[width] duration-700"
                              style={{ width: `${pct}%`, background: bandStyles[b.key].fill }}
                            />
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Skeleton className="h-48" />
              )}
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

function Metric({ label, value }: { label: string; value: number | string | undefined }) {
  return (
    <Card className="p-4 sm:p-5">
      <p className="text-sm text-subtle">{label}</p>
      {value === undefined ? (
        <Skeleton className="mt-2 h-9 w-16" />
      ) : (
        <p className="mt-1 font-serif text-4xl text-ink tabular-nums">{value}</p>
      )}
    </Card>
  );
}
