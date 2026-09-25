import type * as React from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded-2xl border bg-surface-card shadow-[0_1px_2px_rgb(21_29_53/0.04)]",
        className,
      )}
      {...props}
    />
  );
}
