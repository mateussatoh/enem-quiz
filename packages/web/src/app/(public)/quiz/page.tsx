import type { Metadata } from "next";
import { QuizFlow } from "@/features/quiz/components/quiz-flow";

export const metadata: Metadata = { title: "Quiz" };

export default function QuizPage() {
  return <QuizFlow />;
}
