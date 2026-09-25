"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

export const Sheet = Dialog.Root;
export const SheetTitle = Dialog.Title;
export const SheetDescription = Dialog.Description;

/** Right-side drawer on desktop, bottom sheet on phones. */
export function SheetContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Dialog.Content>) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=open]:fade-in data-[state=closed]:animate-out data-[state=closed]:fade-out" />
      <Dialog.Content
        className={cn(
          "fixed z-50 flex flex-col bg-surface-card shadow-2xl outline-none",
          "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-2xl data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom",
          "sm:inset-y-0 sm:right-0 sm:left-auto sm:max-h-none sm:w-[480px] sm:rounded-none sm:rounded-l-2xl sm:data-[state=open]:slide-in-from-right sm:data-[state=closed]:slide-out-to-right",
          className,
        )}
        {...props}
      >
        {children}
        <Dialog.Close className="absolute top-4 right-4 rounded-md p-1.5 text-subtle transition hover:bg-surface-tint hover:text-ink focus-visible:ring-[3px] focus-visible:ring-brand-line focus-visible:outline-none">
          <X className="size-5" />
          <span className="sr-only">Fechar</span>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
