import type { Metadata } from "next";
import { ResultView } from "@/features/result/components/result-view";

export const metadata: Metadata = { title: "Seu diagnóstico", robots: { index: false } };

export default async function ResultPage({ params }: PageProps<"/resultado/[id]">) {
  const { id } = await params;
  return <ResultView id={id} />;
}
