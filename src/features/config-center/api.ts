"use client";

import { requestWithAuth } from "../auth/authApi";
import { readStoredAuth } from "../auth/authStorage";
import { publicEnv } from "../../shared/config/public-env";

export const API_BASE = publicEnv.configApiBaseUrl;

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const stored = readStoredAuth();
  return requestWithAuth<T>(
    `${API_BASE}${path}`,
    stored?.accessToken ?? null,
    init,
  );
}
