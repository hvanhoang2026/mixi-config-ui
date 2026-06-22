'use client';

import { requestWithAuth } from '../auth/authApi';
import { readStoredAuth } from '../auth/authStorage';

const API_BASE = process.env.NEXT_PUBLIC_CONFIG_API_BASE_URL ?? 'http://localhost:3031';

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const stored = readStoredAuth();
  return requestWithAuth<T>(`${API_BASE}${path}`, stored?.accessToken ?? null, init);
}
