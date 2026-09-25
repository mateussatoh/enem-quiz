import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <h1 className="font-serif text-4xl">Página não encontrada</h1>
      <p className="text-subtle">O link pode ter expirado ou estar incorreto.</p>
      <Button asChild size="lg">
        <Link href="/">Voltar ao início</Link>
      </Button>
    </main>
  );
}
