import { describe, expect, it } from "vitest";
import { resolvePublicEnv } from "./public-env";

describe("resolvePublicEnv", () => {
  it("uses the auth API deployment when the production variable is missing", () => {
    const env = resolvePublicEnv({
      nodeEnv: "production",
      authApiBaseUrl: undefined,
      configApiBaseUrl: undefined,
    });

    expect(`${env.authApiBaseUrl}/users/me`).toBe(
      "https://w-gateway.vercel.app/auth/users/me",
    );
  });

  it("keeps the local auth API fallback outside production", () => {
    const env = resolvePublicEnv({
      nodeEnv: "development",
      authApiBaseUrl: undefined,
      configApiBaseUrl: undefined,
    });

    expect(env.authApiBaseUrl).toBe("http://localhost:3001/api");
  });
});
