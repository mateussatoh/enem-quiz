import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The page uses the Plataforma Assaad brand and collects personal data, so it must never be
 * mistaken for an official channel.
 */
export function PrototypeNotice({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start justify-center gap-1.5 px-5 py-4 text-center text-xs text-subtle",
        className,
      )}
    >
      <Info className="mt-px size-3.5 shrink-0" aria-hidden />
      <span>
        Protótipo desenvolvido para o processo seletivo da Assaad Educação. Não é um canal oficial.
      </span>
    </p>
  );
}
