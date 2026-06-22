'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ProgressSpinner } from 'primereact/progressspinner';
import { useAuth } from './AuthProvider';

type Props = {
  children: ReactNode;
};

export function AuthGuard({ children }: Props) {
  const { initialized, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;
    if (isAuthenticated) return;

    const next = pathname ? `?next=${encodeURIComponent(pathname)}` : '';
    router.replace(`/login${next}`);
  }, [initialized, isAuthenticated, pathname, router]);

  if (!initialized || !isAuthenticated) {
    return (
      <div className="route-guard">
        <ProgressSpinner
          style={{ width: '48px', height: '48px' }}
          strokeWidth="4"
          animationDuration=".8s"
        />
        <span>Checking access...</span>
      </div>
    );
  }

  return <>{children}</>;
}
