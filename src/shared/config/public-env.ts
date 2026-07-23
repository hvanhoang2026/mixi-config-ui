const DEFAULT_AUTH_API_BASE_URL = "http://localhost:3001/api";
const DEFAULT_CONFIG_API_BASE_URL = "http://localhost:3031";

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

export const publicEnv = Object.freeze({
  authApiBaseUrl: readHttpUrl(
    "NEXT_PUBLIC_AUTH_API_BASE_URL",
    process.env.NEXT_PUBLIC_AUTH_API_BASE_URL,
    DEFAULT_AUTH_API_BASE_URL,
  ),
  configApiBaseUrl: readHttpUrl(
    "NEXT_PUBLIC_CONFIG_API_BASE_URL",
    process.env.NEXT_PUBLIC_CONFIG_API_BASE_URL,
    DEFAULT_CONFIG_API_BASE_URL,
  ),
});
