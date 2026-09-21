const DEFAULT_GATEWAY_URL = "https://w-gateway.vercel.app";

function readHttpUrl(
  name: string,
  value: string | undefined,
  fallback?: string,
) {
  const candidates = [value?.trim(), fallback].filter(
    (candidate): candidate is string => Boolean(candidate),
  );

  for (const candidate of candidates) {
    try {
      const url = new URL(candidate);
      if (url.protocol === "http:" || url.protocol === "https:") {
        return url.toString().replace(/\/$/, "");
      }
    } catch {
      // Try the safe default when a deployment variable is malformed.
    }
  }

  throw new Error(`${name} must be a valid HTTP(S) URL.`);
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
    ecmApiBaseUrl: `${baseUrl}/ecm`,
  });
}

export const publicEnv = resolvePublicEnv({
  gatewayUrl: process.env.W_API_PROXY_TARGET,
});
