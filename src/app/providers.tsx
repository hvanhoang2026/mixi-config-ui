"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WPrimeProvider } from "@w-iris/react";
import { ReactNode, useState } from "react";
import { AuthProvider } from "../features/auth/AuthProvider";

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );
  return (
    <WPrimeProvider>
      <QueryClientProvider client={client}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </WPrimeProvider>
  );
}
