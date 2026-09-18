import { afterEach, describe, expect, it, vi } from "vitest";
import {
  authApi,
  mergeMyProfile,
  normalizeAccountSettings,
  requestWithAuth,
} from "./authApi";

describe("mergeMyProfile", () => {
  it("preserves the complete users/me profile contract", () => {
    expect(
      mergeMyProfile(
        { id: "login-id", email: "login@example.com", roles: ["ADMIN"] },
        {
          id: "user-1",
          email: "user@example.com",
          tenantId: "tenant-1",
          tenantCode: "mixi",
          tenantName: "Mixi",
          mustChangePassword: true,
          profile: {
            fullName: "Mixi User",
            phone: "0900000000",
            bio: "Profile bio",
            locale: "vi-VN",
            timeZone: "Asia/Ho_Chi_Minh",
            socialLinks: { github: "https://github.com/mixi" },
          },
        },
      ),
    ).toMatchObject({
      id: "user-1",
      email: "user@example.com",
      roles: ["ADMIN"],
      fullName: "Mixi User",
      phone: "0900000000",
      bio: "Profile bio",
      locale: "vi-VN",
      timeZone: "Asia/Ho_Chi_Minh",
      tenantCode: "mixi",
      mustChangePassword: true,
      socialLinks: { github: "https://github.com/mixi" },
    });
  });
});

describe("normalizeAccountSettings", () => {
  it("extracts workspace preferences and notifications from the profile response", () => {
    expect(
      normalizeAccountSettings({
        locale: "vi-VN",
        timeZone: "Asia/Ho_Chi_Minh",
        theme: "lara-dark-purple",
        colorScheme: "dark",
        notifications: { email: false, sms: true, inApp: true },
      }),
    ).toEqual({
      locale: "vi-VN",
      timeZone: "Asia/Ho_Chi_Minh",
      theme: "lara-dark-purple",
      colorScheme: "dark",
      notifications: { email: false, sms: true, inApp: true },
    });
  });
});

describe("authApi.getMfaStatus", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads the authenticated MFA status used by account security", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ enabled: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const payload = window.btoa(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 60 }),
    );
    const accessToken = `header.${payload}.signature`;

    await expect(authApi.getMfaStatus(accessToken)).resolves.toEqual({
      enabled: true,
    });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringMatching(/\/auth\/mfa\/status$/),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${accessToken}`,
        }),
      }),
    );
  });
});

describe("requestWithAuth timeout", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("uses the caller-specific timeout for long-running requests", async () => {
    vi.useFakeTimers();
    const fetchMock = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => {
            reject(new DOMException("The operation was aborted", "AbortError"));
          });
        }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const payload = window.btoa(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 60 }),
    );
    const request = requestWithAuth(
      "https://config.example.test/configs/bulk-upsert",
      `header.${payload}.signature`,
      { method: "POST" },
      120_000,
    );
    const rejection = expect(request).rejects.toMatchObject({
      name: "AbortError",
    });

    await vi.advanceTimersByTimeAsync(119_999);
    expect(fetchMock.mock.calls[0]?.[1]?.signal?.aborted).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    await rejection;
  });
});
