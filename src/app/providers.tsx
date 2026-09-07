"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { App, ConfigProvider } from "antd";
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
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0f766e",
          colorInfo: "#0f766e",
          borderRadius: 10,
          controlHeight: 40,
          zIndexPopupBase: 2000,
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        },
        components: {
          Select: { zIndexPopup: 2200 },
          Table: { headerBg: "#f1f5f4", headerColor: "#334155" },
        },
      }}
    >
      <QueryClientProvider client={client}>
        <App>
          <AuthProvider>{children}</AuthProvider>
        </App>
      </QueryClientProvider>
    </ConfigProvider>
  );
}
