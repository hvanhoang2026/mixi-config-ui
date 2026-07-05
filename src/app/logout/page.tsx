'use client';

import { AdminLogoutView } from '@w-iris/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../../features/auth/AuthProvider';

export default function LogoutPage() {
  const router = useRouter();
  const { logout } = useAuth();

  useEffect(() => {
    void logout().finally(() => {
      window.setTimeout(() => router.replace('/login'), 300);
    });
  }, [logout, router]);

  return <AdminLogoutView teamName="Mixi Config" />;
}
