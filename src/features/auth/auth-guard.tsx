"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

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

    const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
    router.replace(`/login${next}`);
  }, [initialized, isAuthenticated, pathname, router]);

  if (!initialized || !isAuthenticated) return null;

  return <>{children}</>;
}
