"use client";

import { loginSchema, type LoginInput } from "@enem-quiz/shared/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { safeAdminNext } from "@/lib/safe-next";
import { login } from "../api";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const expired = params.get("expirou") === "1";
  const next = safeAdminNext(params.get("next"));
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (expired) toast.info("Sua sessão expirou. Entre novamente.");
  }, [expired]);

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      router.replace(next as "/admin");
      router.refresh();
    },
    onError: (error) => form.setError("root", { message: error.message }),
  });

  const { errors } = form.formState;

  return (
    <form
      noValidate
      onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          type="email"
          autoComplete="username"
          aria-invalid={!!errors.email}
          {...form.register("email")}
        />
        {errors.email && <p className="text-sm text-danger">{errors.email.message}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...form.register("password")}
        />
        {errors.password && <p className="text-sm text-danger">{errors.password.message}</p>}
      </div>
      {errors.root && (
        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {errors.root.message}
        </p>
      )}
      <Button type="submit" size="lg" loading={mutation.isPending} className="mt-2">
        Entrar
      </Button>
    </form>
  );
}
