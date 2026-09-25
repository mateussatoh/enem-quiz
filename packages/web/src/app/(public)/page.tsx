import { ArrowRight, Clock, ListChecks, Sparkles } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";

// Static on purpose: it is the ad landing page, so it ships as prerendered HTML for a fast first
// paint on phones. Quiz content is fetched from the API only once the student starts.
export const dynamic = "force-static";

const highlights = [
  { icon: Clock, text: "Leva cerca de 2 minutos" },
  { icon: ListChecks, text: "10 perguntas sobre sua rotina" },
  { icon: Sparkles, text: "Diagnóstico na hora" },
];

export default function LandingPage() {
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
          Qual é a sua chance <span className="text-brand">real</span> de passar no ENEM?
        </h1>
        <p className="mt-5 max-w-xl text-lg text-ink-soft">
          Responda 10 perguntas rápidas sobre a sua preparação e descubra em que ponto você está, e
          o que mais faz diferença daqui até a prova.
        </p>

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
