"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AntdProvider } from "@w-iris/react";
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
    <AntdProvider themeColor="#11675e" pageStyle="comfortable">
      <QueryClientProvider client={client}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </AntdProvider>
  );
}
