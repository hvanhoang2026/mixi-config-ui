const DEFAULT_GATEWAY_URL = "https://w-gateway.vercel.app";

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
  gatewayUrl,
}: {
  gatewayUrl: string | undefined;
}) {
  const baseUrl = readHttpUrl(
    "W_API_PROXY_TARGET",
    gatewayUrl,
    DEFAULT_GATEWAY_URL,
  );
  return Object.freeze({
    authApiBaseUrl: `${baseUrl}/auth`,
    configApiBaseUrl: `${baseUrl}/config`,
  });
}

export const publicEnv = resolvePublicEnv({
  gatewayUrl: process.env.W_API_PROXY_TARGET,
});
