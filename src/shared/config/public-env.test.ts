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

  it("uses the safe gateway when the deployment variable is malformed", () => {
    const env = resolvePublicEnv({
      gatewayUrl: "W_API_PROXY_TARGET=https://w-gateway.vercel.app",
    });

    expect(env.authApiBaseUrl).toBe("https://w-gateway.vercel.app/auth");
    expect(env.configApiBaseUrl).toBe("https://w-gateway.vercel.app/config");
    expect(env.ecmApiBaseUrl).toBe("https://w-gateway.vercel.app/ecm");
  });
});
