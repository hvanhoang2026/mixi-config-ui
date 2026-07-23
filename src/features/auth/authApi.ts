"use client";

import {
  clearStoredAuth,
  isTokenExpired,
  readStoredAuth,
  writeStoredAuth,
} from "./authStorage";
import { publicEnv } from "../../shared/config/public-env";

const AUTH_BASE_URL = publicEnv.authApiBaseUrl;
const AUTH_REFRESHED_EVENT = "mixi-config:auth-refreshed";
const REQUEST_TIMEOUT_MS = 15_000;
let refreshPromise: Promise<string | null> | null = null;

function redirectToLogin() {
  if (typeof window === "undefined") {
    return;
  }

  clearStoredAuth();
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function readErrorMessage(value: unknown, fallback: string) {
  if (!value || typeof value !== "object" || !("message" in value))
    return fallback;
  const message = (value as Record<string, unknown>).message;
  if (typeof message === "string") return message;
  if (
    Array.isArray(message) &&
    message.every((item): item is string => typeof item === "string")
  ) {
    return message.join(", ");
  }
  return fallback;
}

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit) {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT_MS,
  );
  try {
    return await fetch(input, {
      ...init,
      signal: init?.signal ?? controller.signal,
    });
  } finally {
    window.clearTimeout(timeout);
  }
}

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string | null;
  avatarUrl?: string | null;
  tenantId?: string | null;
  tenantCode?: string | null;
  tenantName?: string | null;
  roles?: string[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface MfaRequiredResponse {
  requiresMfa: true;
  message?: string;
}

export type LoginResponse = AuthResponse | MfaRequiredResponse;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetchWithTimeout(`${AUTH_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = response.statusText || "Request failed";
    try {
      const errorData: unknown = await response.json();
      message = readErrorMessage(errorData, message);
    } catch {
      // ignore
    }
    throw new ApiError(message, response.status);
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : {}) as T;
}

function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

function withBearerToken(
  init: RequestInit | undefined,
  accessToken: string,
): RequestInit {
  return {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
  };
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const stored = readStoredAuth();
    if (!stored?.refreshToken) return null;

    try {
      const refreshed = await request<AuthResponse>("/auth/refresh", {
        method: "POST",
        body: JSON.stringify({ refreshToken: stored.refreshToken }),
      });

      writeStoredAuth(
        {
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken,
          user: refreshed.user ?? stored.user,
        },
        Boolean(stored.remember),
      );

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(AUTH_REFRESHED_EVENT, {
            detail: {
              accessToken: refreshed.accessToken,
              refreshToken: refreshed.refreshToken,
            },
          }),
        );
      }

      return refreshed.accessToken;
    } catch {
      clearStoredAuth();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function requestWithAuth<T>(
  input: string,
  accessToken: string | null,
  init?: RequestInit,
): Promise<T> {
  let effectiveToken: string | null = accessToken;

  if (!effectiveToken || isTokenExpired(effectiveToken)) {
    effectiveToken = await refreshAccessToken();
    if (!effectiveToken) {
      redirectToLogin();
      throw new Error("Session expired");
    }
  }

  try {
    const response = await fetchWithTimeout(
      input,
      withBearerToken(init, effectiveToken),
    );
    if (!response.ok) {
      let message = response.statusText || "Request failed";
      try {
        const errorData: unknown = await response.json();
        message = readErrorMessage(errorData, message);
      } catch {
        // ignore
      }
      throw new ApiError(message, response.status);
    }
    const text = await response.text();
    return (
      text
        ? response.headers.get("content-type")?.includes("application/json")
          ? JSON.parse(text)
          : text
        : {}
    ) as T;
  } catch (error) {
    if (!isApiError(error) || error.status !== 401) {
      throw error;
    }

    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken) {
      redirectToLogin();
      throw new Error("Session expired");
    }

    const retried = await fetchWithTimeout(
      input,
      withBearerToken(init, refreshedToken),
    );
    if (!retried.ok) {
      if (retried.status === 401) {
        redirectToLogin();
      }
      throw new Error(await retried.text());
    }
    const text = await retried.text();
    return (
      text
        ? retried.headers.get("content-type")?.includes("application/json")
          ? JSON.parse(text)
          : text
        : {}
    ) as T;
  }
}

export const authApi = {
  login: (data: { email: string; password: string; mfaCode?: string }) =>
    request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  register: (data: { name: string; email: string; password: string }) =>
    request<{ message: string }>("/auth/register/email", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  refresh: (refreshToken: string) =>
    request<AuthResponse>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
  logout: (accessToken: string) =>
    requestWithAuth<{ success: boolean }>(
      `${AUTH_BASE_URL}/auth/logout`,
      accessToken,
      {
        method: "POST",
      },
    ),
  getMyProfile: (accessToken: string) =>
    requestWithAuth<{
      id: string;
      email: string;
      tenantId?: string | null;
      tenantCode?: string | null;
      tenantName?: string | null;
      profile?: Partial<AuthUser> | null;
    }>(`${AUTH_BASE_URL}/users/me`, accessToken),
};

export { AUTH_REFRESHED_EVENT };
