import type * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input"
      className={cn(
        "h-12 w-full min-w-0 rounded-lg border bg-surface-card px-4 text-base text-ink shadow-xs transition outline-none placeholder:text-subtle/70",
        "focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand-line",
        "aria-invalid:border-danger aria-invalid:ring-danger/15",
        className,
      )}
      {...props}
    />
  );
}
