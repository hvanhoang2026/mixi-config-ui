'use client';

import { Suspense } from 'react';
import { LoginFormCard } from '../../components/auth/login-form-card';

export default function LoginPage() {
  return (
    <main className="auth-page sakai-login">
      <Suspense fallback={null}>
        <LoginFormCard />
      </Suspense>
    </main>
  );
}
