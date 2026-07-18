'use client';

import { Suspense } from 'react';
import { LoginFormCard } from '../../components/auth/login-form-card';

export default function LoginPage() {
  return (
    <div data-testid="login-page">
      <Suspense fallback={null}>
      <LoginFormCard />
      </Suspense>
    </div>
  );
}
