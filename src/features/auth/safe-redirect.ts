export function getSafeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return "/config-center";
  }

  try {
    const url = new URL(value, "https://mixi.local");
    return url.origin === "https://mixi.local"
      ? `${url.pathname}${url.search}${url.hash}`
      : "/config-center";
  } catch {
    return "/config-center";
  }
}
