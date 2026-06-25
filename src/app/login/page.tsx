'use client';

import { Suspense } from 'react';
import { LoginFormCard } from '../../components/auth/login-form-card';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginFormCard />
    </Suspense>
  );
}
