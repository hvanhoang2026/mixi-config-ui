'use client';

const API_BASE = process.env.NEXT_PUBLIC_CONFIG_API_BASE_URL ?? 'http://localhost:3031';

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init);
  if (!response.ok) throw new Error(await response.text());
  return response.headers.get('content-type')?.includes('application/json') ? response.json() : (response.text() as Promise<T>);
}
