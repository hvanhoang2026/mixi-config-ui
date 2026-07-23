import { beforeEach, describe, expect, it } from "vitest";
import { isTokenExpired, readStoredAuth } from "./authStorage";

const STORAGE_KEY = "mixi-config-auth";

describe("authStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  it("removes an invalid stored session instead of trusting its shape", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        accessToken: "token",
        user: { email: "user@example.com" },
      }),
    );

    expect(readStoredAuth()).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("treats malformed and expired JWT payloads as expired", () => {
    expect(isTokenExpired("not-a-jwt")).toBe(true);

    const payload = window.btoa(JSON.stringify({ exp: 1 }));
    expect(isTokenExpired(`header.${payload}.signature`)).toBe(true);
  });
});
