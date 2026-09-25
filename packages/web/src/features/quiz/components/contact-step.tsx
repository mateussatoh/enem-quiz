"use client";

import { formatPhone } from "@enem-quiz/shared/utils";
import { leadSchema, type Lead, type LeadInput } from "@enem-quiz/shared/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type ContactFormErrors = Partial<Record<keyof LeadInput, string>>;

type Props = {
  submitting: boolean;
  onSubmit: (lead: Lead, website: string) => void;
  /** Server-side field errors to surface inline (e.g. duplicated e-mail). */
  serverErrors?: ContactFormErrors;
};

// The honeypot travels with the form but is validated (and rejected) by the server only.
const contactFormSchema = leadSchema.extend({ website: z.string() });
type FormInput = z.input<typeof contactFormSchema>;
type FormOutput = z.output<typeof contactFormSchema>;

export function ContactStep({ submitting, onSubmit, serverErrors }: Props) {
  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", phone: "", website: "" },
    mode: "onTouched",
  });
  const { errors } = form.formState;
  const errorFor = (field: keyof LeadInput) => errors[field]?.message ?? serverErrors?.[field];

  return (
    <section aria-labelledby="contact-title" className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-sm font-medium tracking-wide text-brand uppercase">Último passo</p>
        <h1 id="contact-title" className="font-serif text-[1.9rem] leading-tight sm:text-4xl">
          Seu diagnóstico está pronto
        </h1>
        <p className="mt-3 text-ink-soft">
          Diga pra gente como te chamar e onde falar com você para liberar o resultado.
        </p>
      </div>

      <form
        noValidate
        onSubmit={form.handleSubmit(({ website, ...lead }) => onSubmit(lead, website))}
        className="flex flex-col gap-5"
      >
        <Field id="name" label="Nome" error={errorFor("name")}>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Como você se chama?"
            aria-invalid={!!errorFor("name")}
            aria-describedby="name-error"
            {...form.register("name")}
          />
        </Field>

        <Field id="email" label="E-mail" error={errorFor("email")}>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="voce@email.com"
            aria-invalid={!!errorFor("email")}
            aria-describedby="email-error"
            {...form.register("email")}
          />
        </Field>

        <Field id="phone" label="Telefone (WhatsApp)" error={errorFor("phone")}>
          <Input
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(11) 98765-4321"
            aria-invalid={!!errorFor("phone")}
            aria-describedby="phone-error"
            {...form.register("phone", {
              onChange: (e) =>
                form.setValue("phone", formatPhone(e.target.value), {
                  shouldValidate: !!form.formState.errors.phone,
                }),
            })}
          />
        </Field>

        {/* Honeypot: hidden from people and assistive tech, bots fill it. */}
        <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
          <label htmlFor="website">Site</label>
          <input id="website" tabIndex={-1} autoComplete="off" {...form.register("website")} />
        </div>

        <Button type="submit" variant="cta" size="xl" loading={submitting} className="mt-2 w-full">
          {submitting ? "Calculando seu diagnóstico" : "Ver meu resultado"}
        </Button>

        <p className="flex items-start gap-2 text-xs leading-relaxed text-subtle">
          <LockKeyhole className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          Seus dados ficam protegidos e são usados só para enviar seu diagnóstico e falar sobre a
          sua preparação. Nada de spam.
        </p>
      </form>
    </section>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
      <p
        id={`${id}-error`}
        role={error ? "alert" : undefined}
        className="min-h-5 text-sm text-danger"
      >
        {error}
      </p>
    </div>
  );
}
