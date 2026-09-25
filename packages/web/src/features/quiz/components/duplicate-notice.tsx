import { MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = { message: string; onUseAnotherEmail: () => void; onGoHome: () => void };

/** Shown on 409: the earlier diagnostic was e-mailed to the address, so there is a way forward. */
export function DuplicateNotice({ message, onUseAnotherEmail, onGoHome }: Props) {
  return (
    <section aria-labelledby="duplicate-title" className="flex flex-col items-start gap-6">
      <div className="grid size-12 place-items-center rounded-full bg-brand-soft text-brand">
        <MailCheck className="size-6" aria-hidden />
      </div>
      <div>
        <h1 id="duplicate-title" className="font-serif text-[1.9rem] leading-tight sm:text-4xl">
          Você já tem um diagnóstico
        </h1>
        <p role="status" className="mt-3 text-ink-soft">
          {message}.
        </p>
      </div>
      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <Button size="lg" onClick={onGoHome} className="sm:flex-1">
          Voltar ao início
        </Button>
        <Button size="lg" variant="outline" onClick={onUseAnotherEmail} className="sm:flex-1">
          Usar outro e-mail
        </Button>
      </div>
    </section>
  );
}
