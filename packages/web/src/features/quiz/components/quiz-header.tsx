import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";

type Props = { current: number; total: number; onBack?: () => void; label: string };

export function QuizHeader({ current, total, onBack, label }: Props) {
  const percent = Math.round((current / total) * 100);
  return (
    <header className="sticky top-0 z-10 bg-surface-page/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-2xl items-center justify-between gap-3 px-5">
        {onBack ? (
          <Button variant="ghost" size="sm" onClick={onBack} className="-ml-2">
            <ArrowLeft /> Voltar
          </Button>
        ) : (
          <Logo />
        )}
        <span className="text-sm font-medium text-subtle tabular-nums" aria-live="polite">
          {label}
        </span>
      </div>
      <div
        className="h-1 w-full bg-surface-tint"
        role="progressbar"
        aria-label="Progresso do quiz"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
      >
        <div
          className="h-full rounded-r-full bg-brand transition-[width] duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </header>
  );
}
