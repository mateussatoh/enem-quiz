"use client";

import { BANDS } from "@enem-quiz/shared/domain";
import type { SubmissionResult } from "@enem-quiz/shared/types";
import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { bandStyles } from "@/components/common/band-badge";
import { Logo } from "@/components/common/logo";
import { ErrorState, LoadingState } from "@/components/common/states";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fetchResult, quizKeys } from "@/features/quiz/api";
import { track } from "@/lib/analytics";
import { isApiError } from "@/lib/http";
import { cn } from "@/lib/utils";
import { ScoreRing } from "./score-ring";

export function ResultView({ id }: { id: string }) {
  const query = useQuery({ queryKey: quizKeys.result(id), queryFn: () => fetchResult(id) });

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex h-16 max-w-2xl items-center px-5">
        <Logo />
      </header>
      <main className="mx-auto max-w-2xl px-5 pb-16">
        {query.isPending ? (
          <LoadingState label="Carregando seu diagnóstico" />
        ) : query.isError ? (
          isApiError(query.error) && query.error.status === 404 ? (
            <ErrorState message="Não encontramos este diagnóstico. Que tal fazer o quiz?" />
          ) : (
            <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
          )
        ) : (
          <Result result={query.data} />
        )}
        {query.isError && (
          <div className="flex justify-center">
            <Button asChild variant="cta" size="lg">
              <Link href="/quiz">Fazer o diagnóstico</Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

function Result({ result }: { result: SubmissionResult }) {
  const style = bandStyles[result.band.key];

  useEffect(() => {
    track("result_viewed", { score: result.score, band: result.band.key });
  }, [result.resultId, result.score, result.band.key]);

  return (
    <div className="flex flex-col gap-8 pt-4">
      <Card className="flex flex-col items-center gap-6 px-6 py-10 text-center">
        <p className="text-subtle">{result.firstName}, este é o seu diagnóstico</p>
        <ScoreRing score={result.score} band={result.band.key} />
        <div className="flex flex-col items-center gap-3">
          <span className={cn("rounded-full border px-4 py-1 text-sm font-semibold", style.badge)}>
            {result.band.label}
          </span>
          <p className="max-w-md font-serif text-2xl leading-snug text-ink">
            {result.band.message}
          </p>
        </div>
        <BandScale current={result.band.key} />
      </Card>

      <Card className="flex items-start gap-4 border-brand-line bg-brand-soft/60 p-5">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-brand text-white">
          <MessageCircle className="size-5" aria-hidden />
        </div>
        <div>
          <p className="font-medium text-ink">Próximo passo</p>
          <p className="text-sm text-ink-soft">
            Um especialista vai falar com você pelo WhatsApp com um plano de estudos para a sua
            faixa.
          </p>
        </div>
      </Card>

      <section aria-labelledby="answers-title">
        <h2 id="answers-title" className="mb-4 font-serif text-2xl">
          Suas respostas
        </h2>
        <ol className="flex flex-col divide-y rounded-2xl border bg-surface-card">
          {result.answers.map((a) => (
            <li key={a.position} className="flex gap-4 px-5 py-4">
              <span className="w-6 shrink-0 font-serif text-lg text-brand tabular-nums">
                {a.position}
              </span>
              <div>
                <p className="text-sm text-subtle">{a.question}</p>
                <p className="mt-0.5 font-medium text-ink">{a.answer}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function BandScale({ current }: { current: SubmissionResult["band"]["key"] }) {
  return (
    <div className="grid w-full max-w-md grid-cols-4 gap-1.5" aria-hidden>
      {BANDS.map((b) => (
        <div key={b.key} className="flex flex-col gap-1.5">
          <div
            className={cn("h-1.5 rounded-full", b.key === current ? "" : "opacity-25")}
            style={{ background: bandStyles[b.key].fill }}
          />
          <span
            className={cn(
              "text-[11px] leading-tight",
              b.key === current ? "font-semibold text-ink" : "text-subtle",
            )}
          >
            {b.label}
          </span>
        </div>
      ))}
    </div>
  );
}
