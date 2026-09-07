"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoadingIcon } from "../../components/ui/loading-icon";
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

  if (!initialized) {
    return (
      <div className="auth-guard-loading">
        <LoadingIcon />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
