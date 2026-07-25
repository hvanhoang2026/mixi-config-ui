import { afterEach, describe, expect, it, vi } from "vitest";
import { authApi, normalizeAccountSettings } from "./authApi";

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
