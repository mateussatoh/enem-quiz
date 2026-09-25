import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/features/admin/components/admin-shell";
import { getAdminSession } from "@/lib/session";

export const metadata: Metadata = { robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) {
    const requested = (await headers()).get("x-pathname");
    redirect(requested ? `/admin/login?next=${encodeURIComponent(requested)}` : "/admin/login");
  }
  return <AdminShell email={session.email}>{children}</AdminShell>;
}
