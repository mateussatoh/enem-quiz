import Link from "next/link";
import { cn } from "@/lib/utils";
import { AssaadLogo } from "./assaad-logo";

export function Logo({ className, href = "/" }: { className?: string; href?: "/" | "/admin" }) {
  return (
    <Link
      href={href}
      aria-label="Diagnóstico ENEM, Plataforma Assaad"
      className={cn("inline-flex items-center gap-3", className)}
    >
      <AssaadLogo className="h-7 sm:h-8" />
      <span aria-hidden className="h-6 w-px bg-line" />
      <span className="text-sm leading-tight font-semibold text-ink-soft">
        Diagnóstico
        <br />
        ENEM
      </span>
    </Link>
  );
}
