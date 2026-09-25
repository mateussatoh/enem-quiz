import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/common/logo";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/features/admin/components/login-form";
import { getAdminSession } from "@/lib/session";

export const metadata: Metadata = { title: "Entrar", robots: { index: false } };

export default async function LoginPage() {
  if (await getAdminSession()) redirect("/admin");

  return (
    <main className="flex min-h-dvh items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <Card className="p-6 sm:p-8">
          <h1 className="font-serif text-3xl">Área do time</h1>
          <p className="mt-1 mb-6 text-sm text-subtle">Entre para acompanhar os leads do quiz.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </Card>
      </div>
    </main>
  );
}
