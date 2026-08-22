"use client";

import { AdminRegisterForm } from "@w-iris/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authApi } from "../../features/auth/authApi";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    severity: "success" | "error";
    text: string;
  } | null>(null);

  return (
    <div data-testid="register-page">
      <AdminRegisterForm
        teamName="Mixi Config"
        loginHref="/login"
        loading={loading}
        message={message}
        onSubmit={async ({ name, email, password }) => {
          setLoading(true);
          setMessage(null);
          try {
            const response = await authApi.register({ name, email, password });
            setMessage({
              severity: "success",
              text: response.message || "Account created. You can sign in now.",
            });
            window.setTimeout(() => router.push("/login"), 900);
          } catch (error) {
            setMessage({
              severity: "error",
              text:
                error instanceof Error
                  ? error.message
                  : "Unable to create account.",
            });
          } finally {
            setLoading(false);
          }
        }}
      />
    </div>
  );
}
