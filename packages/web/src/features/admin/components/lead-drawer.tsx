"use client";

import { formatPhone } from "@enem-quiz/shared/utils";
import { useQuery } from "@tanstack/react-query";
import { Mail, Phone } from "lucide-react";
import { BandBadge, bandStyles } from "@/components/common/band-badge";
import { ErrorState, LoadingState } from "@/components/common/states";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { cn, formatDateTime } from "@/lib/utils";
import { adminKeys, fetchLead } from "../api";

export function LeadDrawer({ leadId, onClose }: { leadId: string | null; onClose: () => void }) {
  const query = useQuery({
    queryKey: adminKeys.lead(leadId ?? ""),
    queryFn: () => fetchLead(leadId!),
    enabled: !!leadId,
  });
  const lead = query.data;

  return (
    <Sheet open={!!leadId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent aria-describedby={undefined}>
        {query.isPending ? (
          <>
            <SheetTitle className="sr-only">Carregando lead</SheetTitle>
            <LoadingState />
          </>
        ) : query.isError || !lead ? (
          <>
            <SheetTitle className="sr-only">Erro</SheetTitle>
            <ErrorState
              message={query.error?.message ?? "Lead não encontrado"}
              onRetry={() => query.refetch()}
            />
          </>
        ) : (
          <>
            <div className="border-b px-6 pt-6 pb-5">
              <SheetTitle className="pr-10 font-serif text-2xl">{lead.name}</SheetTitle>
              <SheetDescription className="mt-1 text-sm text-subtle">
                Cadastro em {formatDateTime(lead.createdAt)}
              </SheetDescription>
              <div className="mt-4 flex flex-col gap-2 text-sm">
                <a
                  href={`mailto:${lead.email}`}
                  className="inline-flex items-center gap-2 text-ink-soft hover:text-brand"
                >
                  <Mail className="size-4 text-subtle" aria-hidden /> {lead.email}
                </a>
                <a
                  href={`https://wa.me/55${lead.phone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-ink-soft hover:text-brand"
                >
                  <Phone className="size-4 text-subtle" aria-hidden /> {formatPhone(lead.phone)}
                </a>
              </div>
              <div className="mt-5 flex items-center gap-4 rounded-xl bg-surface-page p-4">
                <span
                  className={cn(
                    "font-serif text-5xl leading-none tabular-nums",
                    bandStyles[lead.band.key].text,
                  )}
                >
                  {lead.score}
                </span>
                <div className="flex flex-col gap-1">
                  <BandBadge band={lead.band} className="w-fit" />
                  <span className="text-xs text-subtle">pontuação de 0 a 100</span>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <h3 className="mb-3 text-sm font-medium tracking-wide text-subtle uppercase">
                Respostas ({lead.answers.length})
              </h3>
              <ol className="flex flex-col gap-3">
                {lead.answers.map((a) => (
                  <li key={a.position} className="rounded-xl border p-4">
                    <p className="text-sm text-subtle">
                      {a.position}. {a.question}
                    </p>
                    <div className="mt-1 flex items-start justify-between gap-3">
                      <p className="font-medium text-ink">{a.answer}</p>
                      <span className="shrink-0 rounded-md bg-surface-tint px-2 py-0.5 text-xs text-ink-soft tabular-nums">
                        {a.weight} pts
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
