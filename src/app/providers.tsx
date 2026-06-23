'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { GlobalLoadingProvider } from '../components/loading/global-loading';
import { AuthProvider } from '../features/auth/AuthProvider';

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={client}>
      <GlobalLoadingProvider>
        <AuthProvider>{children}</AuthProvider>
      </GlobalLoadingProvider>
    </QueryClientProvider>
  );
}
