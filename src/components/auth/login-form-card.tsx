'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';
import { Divider } from 'primereact/divider';
import { InputText } from 'primereact/inputtext';
import { Message } from 'primereact/message';
import { Password } from 'primereact/password';
import { useAuth } from '../../features/auth/AuthProvider';

const REMEMBER_CREDENTIALS_KEY = 'mixi-config-remember-credentials';

export function LoginFormCard() {
  const { login, user, loading, isAuthenticated, initialized } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(REMEMBER_CREDENTIALS_KEY);
    if (!raw) return;

    try {
      const remembered = JSON.parse(raw) as { email?: string; password?: string };
      if (remembered.email) setEmail(remembered.email);
      if (remembered.password) setPassword(remembered.password);
      if (remembered.email || remembered.password) setChecked(true);
    } catch {
      window.localStorage.removeItem(REMEMBER_CREDENTIALS_KEY);
    }
  }, []);

  useEffect(() => {
    if (!initialized || !isAuthenticated) return;
    const next = searchParams.get('next') || '/config-center';
    router.replace(next);
  }, [initialized, isAuthenticated, router, searchParams]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');

    try {
      const trimmedEmail = email.trim();
      await login(trimmedEmail, password, checked);

      if (typeof window !== 'undefined') {
        if (checked) {
          window.localStorage.setItem(
            REMEMBER_CREDENTIALS_KEY,
            JSON.stringify({ email: trimmedEmail, password }),
          );
        } else {
          window.localStorage.removeItem(REMEMBER_CREDENTIALS_KEY);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    }
  }

  return (
    <div className="auth-page__container">
      <div className="auth-page__logo-wrap">
        <div className="auth-page__logo-mark">M</div>
        <span className="auth-page__logo-text">MIXI CONFIG</span>
      </div>
      <div className="auth-page__frame">
        <Card className="auth-page__card">
          <div className="auth-page__welcome">
            <div className="auth-page__avatar-badge">
              <i className="pi pi-user" />
            </div>
            <div className="text-900 text-3xl font-medium mb-3">Welcome back</div>
            <span className="text-600 font-medium">
              Sign in to continue to Config Center
            </span>
          </div>

          {initialized ? (
            <form className="auth-page__form" onSubmit={handleSubmit}>
              {error ? <Message severity="error" text={error} className="w-full mb-4" /> : null}
              <label htmlFor="config-email" className="block text-900 text-xl font-medium mb-2">
                Email
              </label>
              <InputText
                id="config-email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email address"
                className="w-full auth-page__input mb-5"
                required
              />

              <label htmlFor="config-password" className="block text-900 text-xl font-medium mb-2">
                Password
              </label>
              <Password
                inputId="config-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                feedback={false}
                toggleMask
                className="w-full mb-5 auth-page__password"
                inputClassName="w-full auth-page__input"
                required
              />

              <div className="auth-page__row mb-5">
                <div className="flex align-items-center">
                  <Checkbox
                    inputId="remember-config"
                    checked={checked}
                    onChange={(event) => setChecked(event.checked ?? false)}
                    className="mr-2"
                  />
                  <label htmlFor="remember-config">Remember me</label>
                </div>
                <Link href="/login" className="font-medium no-underline ml-2 text-right auth-page__link">
                  Need access?
                </Link>
              </div>
              <Button
                type="submit"
                label={loading ? 'Signing in...' : 'Sign In'}
                className="w-full p-3 text-xl auth-page__button"
                disabled={loading}
              />
            </form>
          ) : null}
        </Card>
      </div>
    </div>
  );
}
