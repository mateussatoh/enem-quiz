import type { Metadata } from "next";
import { Dashboard } from "@/features/admin/components/dashboard";

export const metadata: Metadata = { title: "Visão geral" };

export default function AdminHomePage() {
  return <Dashboard />;
}
