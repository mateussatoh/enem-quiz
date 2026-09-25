import { ArrowRight, Clock, ListChecks, Sparkles } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";
import { QUIZ_SLUG } from "@/features/quiz/api";
import { getPublicQuiz } from "@/lib/server-api";

// Prerendered HTML for a fast first paint on phones (it is the ad landing page), regenerated
// every minute so marketing's edits to title, subtitle and questions show up without a deploy.
export const revalidate = 60;

// Used only if the API is unreachable while rendering, so the page never breaks.
const FALLBACK = {
  title: "Qual é a sua chance real de passar no ENEM?",
  subtitle:
    "Responda perguntas rápidas sobre a sua preparação e receba um diagnóstico personalizado.",
  questionCount: 10,
};

/** Highlights the word "real" in the title when marketing keeps it. */
function Title({ text }: { text: string }) {
  const parts = text.split(/(\breal\b)/i);
  return parts.map((part, i) =>
    /^real$/i.test(part) ? (
      <span key={i} className="text-brand">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export default async function LandingPage() {
  const quiz = await getPublicQuiz(QUIZ_SLUG);
  const title = quiz?.title ?? FALLBACK.title;
  const subtitle = quiz?.subtitle ?? FALLBACK.subtitle;
  const questionCount = quiz?.questions.length ?? FALLBACK.questionCount;
  const highlights = [
    { icon: Clock, text: "Leva cerca de 2 minutos" },
    { icon: ListChecks, text: `${questionCount} perguntas sobre sua rotina` },
    { icon: Sparkles, text: "Diagnóstico na hora" },
  ];

  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -right-40 size-[520px] rounded-full bg-brand-soft blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-48 -left-32 size-[420px] rounded-full bg-accent-soft blur-3xl"
      />

      <header className="relative mx-auto w-full max-w-5xl px-5 pt-6 sm:px-8">
        <Logo />
      </header>

      <section className="relative mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center px-5 py-12 sm:px-8">
        <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-brand-line bg-surface-card/70 px-3 py-1 text-sm text-brand-strong">
          <span className="size-1.5 rounded-full bg-accent" aria-hidden />
          Diagnóstico gratuito de preparação
        </p>
        <h1 className="max-w-3xl font-serif text-[2.6rem] leading-[1.05] tracking-tight text-ink sm:text-6xl">
          <Title text={title} />
        </h1>
        <p className="mt-5 max-w-xl text-lg text-ink-soft">{subtitle}</p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <Button asChild variant="cta" size="xl" className="w-full sm:w-auto">
            <Link href="/quiz">
              Começar diagnóstico
              <ArrowRight className="size-5" />
            </Link>
          </Button>
          <p className="text-center text-sm text-subtle sm:text-left">Sem cadastro para começar.</p>
        </div>

        <ul className="mt-12 grid gap-3 sm:grid-cols-3">
          {highlights.map(({ icon: Icon, text }) => (
            <li
              key={text}
              className="flex items-center gap-3 rounded-xl border bg-surface-card/80 px-4 py-3 text-ink-soft backdrop-blur"
            >
              <Icon className="size-5 text-brand" aria-hidden />
              {text}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
