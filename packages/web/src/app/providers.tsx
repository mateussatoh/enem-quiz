"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { initAnalytics } from "@/lib/analytics";
import { isApiError } from "@/lib/http";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            // Client errors (4xx) will not fix themselves: fail fast, retry only network/5xx.
            retry: (count, error) =>
              count < 2 && !(isApiError(error) && error.status >= 400 && error.status < 500),
          },
        },
      }),
  );

  useEffect(initAnalytics, []);

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster position="top-center" richColors closeButton />
    </QueryClientProvider>
  );
}
