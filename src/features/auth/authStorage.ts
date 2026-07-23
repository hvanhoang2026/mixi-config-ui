"use client";

import type { AuthResponse } from "./authApi";

const AUTH_STORAGE_KEY = "mixi-config-auth";

export interface StoredAuthSession {
  accessToken: string;
  refreshToken: string;
  user: AuthResponse["user"];
  remember?: boolean;
}

function isStoredAuthSession(value: unknown): value is StoredAuthSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Record<string, unknown>;
  if (
    typeof session.accessToken !== "string" ||
    typeof session.refreshToken !== "string" ||
    !session.user ||
    typeof session.user !== "object"
  ) {
    return false;
  }

  const user = session.user as Record<string, unknown>;
  return typeof user.id === "string" && typeof user.email === "string";
}

function getStorage(remember: boolean): Storage | null {
  if (typeof window === "undefined") return null;
  return remember ? window.localStorage : window.sessionStorage;
}

export function readStoredAuth(): StoredAuthSession | null {
  if (typeof window === "undefined") return null;

  const localValue = window.localStorage.getItem(AUTH_STORAGE_KEY);
  const sessionValue = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
  const rawValue = localValue ?? sessionValue;
  if (!rawValue) return null;

  try {
    const parsed: unknown = JSON.parse(rawValue);
    if (!isStoredAuthSession(parsed)) {
      clearStoredAuth();
      return null;
    }
    return {
      ...parsed,
      remember: Boolean(localValue),
    };
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function writeStoredAuth(session: StoredAuthSession, remember = true) {
  const storage = getStorage(remember);
  if (!storage) return;

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
  storage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ ...session, remember }));
}

export function clearStoredAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
}

export function isTokenExpired(token: string) {
  try {
    const payload = token.split(".")[1];
    if (!payload) return true;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    const decoded: unknown = JSON.parse(window.atob(padded));
    if (!decoded || typeof decoded !== "object") return true;
    const exp = (decoded as Record<string, unknown>).exp;
    return typeof exp !== "number" || exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
