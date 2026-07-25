import { describe, expect, it } from "vitest";
import { resolvePublicEnv } from "./public-env";

describe("resolvePublicEnv", () => {
  it("uses the auth API deployment when the production variable is missing", () => {
    const env = resolvePublicEnv({
      gatewayUrl: undefined,
    });

    expect(`${env.authApiBaseUrl}/users/me`).toBe(
      "https://w-gateway.vercel.app/auth/users/me",
    );
  });

  it("keeps the local auth API fallback outside production", () => {
    const env = resolvePublicEnv({
      gatewayUrl: undefined,
    });

    expect(env.authApiBaseUrl).toBe("https://w-gateway.vercel.app/auth");
  });
});
