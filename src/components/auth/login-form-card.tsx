"use client";

import { AdminLoginForm } from "@w-iris/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../features/auth/AuthProvider";
import { getSafeNextPath } from "../../features/auth/safe-redirect";

const REMEMBER_CREDENTIALS_KEY = "mixi-config-remember-credentials";

export function LoginFormCard() {
  const { login, loading, isAuthenticated, initialized } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!initialized || !isAuthenticated) return;
    const next = getSafeNextPath(searchParams.get("next"));
    router.replace(next);
  }, [initialized, isAuthenticated, router, searchParams]);

  if (!initialized) return null;

  return (
    <div data-testid="login-form">
      <AdminLoginForm
        teamName="Mixi Config"
        loading={loading}
        forgotPasswordHref="/login"
        registerHref="/register"
        rememberStorageKey={REMEMBER_CREDENTIALS_KEY}
        onSubmit={async ({ email, password, remember, mfaCode }) => {
          return login(email, password, remember, mfaCode);
        }}
      />
    </div>
  );
}
