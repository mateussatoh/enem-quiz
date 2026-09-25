import type { Metadata } from "next";
import { Suspense } from "react";
import { LeadsView } from "@/features/admin/components/leads-view";

export const metadata: Metadata = { title: "Leads" };

export default function LeadsPage() {
  return (
    <Suspense>
      <LeadsView />
    </Suspense>
  );
}
