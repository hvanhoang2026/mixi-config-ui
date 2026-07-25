const DEFAULT_AUTH_API_BASE_URL = "http://localhost:3001/api";
const PRODUCTION_AUTH_API_BASE_URL = "https://w-gateway.vercel.app/auth";
const DEFAULT_CONFIG_API_BASE_URL = "https://w-gateway.vercel.app/config";

function readHttpUrl(
  name: string,
  value: string | undefined,
  fallback?: string,
) {
  const candidate = value?.trim() || fallback;
  if (!candidate) {
    throw new Error(`${name} is required.`);
  }

  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      throw new Error("unsupported protocol");
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    throw new Error(`${name} must be a valid HTTP(S) URL.`);
  }
}

export function resolvePublicEnv({
  nodeEnv,
  authApiBaseUrl,
  configApiBaseUrl,
}: {
  nodeEnv: string | undefined;
  authApiBaseUrl: string | undefined;
  configApiBaseUrl: string | undefined;
}) {
  return Object.freeze({
    authApiBaseUrl: readHttpUrl(
      "NEXT_PUBLIC_AUTH_API_BASE_URL",
      authApiBaseUrl,
      nodeEnv === "production"
        ? PRODUCTION_AUTH_API_BASE_URL
        : DEFAULT_AUTH_API_BASE_URL,
    ),
    configApiBaseUrl: readHttpUrl(
      "NEXT_PUBLIC_CONFIG_API_BASE_URL",
      configApiBaseUrl,
      DEFAULT_CONFIG_API_BASE_URL,
    ),
  });
}

export const publicEnv = resolvePublicEnv({
  nodeEnv: process.env.NODE_ENV,
  authApiBaseUrl: process.env.NEXT_PUBLIC_AUTH_API_BASE_URL,
  configApiBaseUrl: process.env.NEXT_PUBLIC_CONFIG_API_BASE_URL,
});
