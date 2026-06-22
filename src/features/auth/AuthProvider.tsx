'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AUTH_REFRESHED_EVENT, authApi, type AuthResponse, type AuthUser } from './authApi';
import { clearStoredAuth, isTokenExpired, readStoredAuth, writeStoredAuth } from './authStorage';

interface AuthState {
  initialized: boolean;
  loading: boolean;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  remember: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const SHARED_AUTH_EVENT = 'mixi:auth';
const SHARED_TOKEN_KEY = 'mixi.shared.accessToken';
const SHARED_TENANT_ID_KEY = 'mixi.shared.tenantId';
const SHARED_TENANT_CODE_KEY = 'mixi.shared.tenantCode';
const SHARED_TENANT_NAME_KEY = 'mixi.shared.tenantName';
const SHARED_ROLES_KEY = 'mixi.shared.roles';

function createAuthenticatedState(
  accessToken: string,
  response: AuthResponse,
  remember: boolean,
): AuthState {
  return {
    initialized: true,
    loading: false,
    isAuthenticated: true,
    accessToken,
    refreshToken: response.refreshToken,
    user: response.user,
    remember,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    initialized: false,
    loading: true,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    user: null,
    remember: false,
  });

  const persistState = useCallback((next: AuthState) => {
    if (next.accessToken && next.refreshToken && next.user) {
      writeStoredAuth(
        {
          accessToken: next.accessToken,
          refreshToken: next.refreshToken,
          user: next.user,
        },
        next.remember,
      );
    }
    setState(next);
  }, []);

  const refreshSession = useCallback(async () => {
    const stored = readStoredAuth();
    if (!stored) {
      clearStoredAuth();
      setState((current) => ({
        ...current,
        initialized: true,
        loading: false,
        isAuthenticated: false,
      }));
      return;
    }

    try {
      if (!isTokenExpired(stored.accessToken)) {
        const profile = await authApi.getMyProfile(stored.accessToken).catch(() => null);
        persistState(
          createAuthenticatedState(
            stored.accessToken,
            {
              accessToken: stored.accessToken,
              refreshToken: stored.refreshToken,
              user: {
                ...stored.user,
                ...profile?.profile,
                email: profile?.email ?? stored.user.email,
                tenantId: profile?.tenantId ?? stored.user.tenantId ?? null,
                tenantCode: profile?.tenantCode ?? stored.user.tenantCode ?? null,
                tenantName: profile?.tenantName ?? stored.user.tenantName ?? null,
              },
            },
            Boolean(stored.remember),
          ),
        );
        return;
      }

      const refreshed = await authApi.refresh(stored.refreshToken);
      const profile = await authApi.getMyProfile(refreshed.accessToken).catch(() => null);
      persistState(
        createAuthenticatedState(
          refreshed.accessToken,
          {
            ...refreshed,
            user: {
              ...stored.user,
              ...refreshed.user,
              ...profile?.profile,
              email: profile?.email ?? refreshed.user.email,
              tenantId: profile?.tenantId ?? refreshed.user.tenantId ?? null,
              tenantCode: profile?.tenantCode ?? refreshed.user.tenantCode ?? null,
              tenantName: profile?.tenantName ?? refreshed.user.tenantName ?? null,
            },
          },
          Boolean(stored.remember),
        ),
      );
    } catch {
      clearStoredAuth();
      setState({
        initialized: true,
        loading: false,
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        user: null,
        remember: false,
      });
    }
  }, [persistState]);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleAuthRefreshed = (event: Event) => {
      const customEvent = event as CustomEvent<{ accessToken?: string; refreshToken?: string }>;
      const nextAccessToken = customEvent.detail?.accessToken;
      const nextRefreshToken = customEvent.detail?.refreshToken;
      if (!nextAccessToken || !nextRefreshToken) return;

      setState((current) => {
        if (!current.isAuthenticated) return current;
        return { ...current, accessToken: nextAccessToken, refreshToken: nextRefreshToken };
      });
    };

    window.addEventListener(AUTH_REFRESHED_EVENT, handleAuthRefreshed as EventListener);
    return () =>
      window.removeEventListener(AUTH_REFRESHED_EVENT, handleAuthRefreshed as EventListener);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isSuperAdmin = state.user?.roles?.includes('SUPERADMIN') ?? false;
    if (state.accessToken) {
      window.localStorage.setItem(SHARED_TOKEN_KEY, state.accessToken);
      window.localStorage.setItem(SHARED_ROLES_KEY, JSON.stringify(state.user?.roles ?? []));
      if (!isSuperAdmin && state.user?.tenantId) window.localStorage.setItem(SHARED_TENANT_ID_KEY, state.user.tenantId);
      else window.localStorage.removeItem(SHARED_TENANT_ID_KEY);
      if (!isSuperAdmin && state.user?.tenantCode) window.localStorage.setItem(SHARED_TENANT_CODE_KEY, state.user.tenantCode);
      else window.localStorage.removeItem(SHARED_TENANT_CODE_KEY);
      if (!isSuperAdmin && state.user?.tenantName) window.localStorage.setItem(SHARED_TENANT_NAME_KEY, state.user.tenantName);
      else window.localStorage.removeItem(SHARED_TENANT_NAME_KEY);
    } else {
      window.localStorage.removeItem(SHARED_TOKEN_KEY);
      window.localStorage.removeItem(SHARED_TENANT_ID_KEY);
      window.localStorage.removeItem(SHARED_TENANT_CODE_KEY);
      window.localStorage.removeItem(SHARED_TENANT_NAME_KEY);
      window.localStorage.removeItem(SHARED_ROLES_KEY);
    }

    window.dispatchEvent(
      new CustomEvent(SHARED_AUTH_EVENT, {
        detail: {
          accessToken: state.accessToken ?? null,
          tenantId: isSuperAdmin ? null : state.user?.tenantId ?? null,
          tenantCode: isSuperAdmin ? null : state.user?.tenantCode ?? null,
          tenantName: isSuperAdmin ? null : state.user?.tenantName ?? null,
          roles: state.user?.roles ?? [],
        },
      }),
    );
  }, [state.accessToken, state.user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login: async (email, password, remember = false) => {
        setState((current) => ({ ...current, loading: true }));
        try {
          const response = await authApi.login({ email, password });
          const profile = await authApi.getMyProfile(response.accessToken).catch(() => null);
          persistState(
            createAuthenticatedState(
              response.accessToken,
              {
                ...response,
                user: {
                  ...response.user,
                  ...profile?.profile,
                  email: profile?.email ?? response.user.email,
                  tenantId: profile?.tenantId ?? response.user.tenantId ?? null,
                  tenantCode: profile?.tenantCode ?? response.user.tenantCode ?? null,
                  tenantName: profile?.tenantName ?? response.user.tenantName ?? null,
                },
              },
              remember,
            ),
          );
        } catch (error) {
          setState((current) => ({ ...current, loading: false }));
          throw error;
        }
      },
      logout: async () => {
        const token = state.accessToken;
        clearStoredAuth();
        setState({
          initialized: true,
          loading: false,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          user: null,
          remember: false,
        });
        if (token) {
          authApi.logout(token).catch(() => undefined);
        }
      },
      refreshSession,
    }),
    [persistState, refreshSession, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
