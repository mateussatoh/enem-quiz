import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: "/" | "/admin" }) {
  return (
    <Link
      href={href}
      className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}
    >
      <span
        aria-hidden
        className="grid size-8 place-items-center rounded-lg bg-brand font-serif text-lg leading-none text-white"
      >
        D
      </span>
      <span className="text-ink">
        Diagnóstico <span className="text-brand">ENEM</span>
      </span>
    </Link>
  );
}
