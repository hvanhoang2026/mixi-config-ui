# Mixi Config API Integration Guide

This guide explains how another service can read runtime configuration from Mixi Config.

## Runtime Endpoint

```text
GET {MIXI_CONFIG_API_URL}/runtime-config/{serviceCode}/{environmentCode}
Authorization: Bearer {MIXI_CONFIG_TOKEN}
```

Replace:

- `{MIXI_CONFIG_API_URL}` with the Mixi Config API base URL.
- `{serviceCode}` with the service code registered in Mixi Config.
- `{environmentCode}` with the target environment code.
- `{MIXI_CONFIG_TOKEN}` with the service access token.

## Required Environment Variables

```env
MIXI_CONFIG_API_URL=https://mixi-config-api.vercel.app
MIXI_CONFIG_TOKEN=<service-access-token>
MIXI_SERVICE_CODE=<service-code>
MIXI_ENVIRONMENT_CODE=<environment-code>
```

## cURL

```bash
curl -H "Authorization: Bearer $MIXI_CONFIG_TOKEN" \
  "$MIXI_CONFIG_API_URL/runtime-config/$MIXI_SERVICE_CODE/$MIXI_ENVIRONMENT_CODE"
```

## Node.js

```ts
const response = await fetch(
  `${process.env.MIXI_CONFIG_API_URL}/runtime-config/${process.env.MIXI_SERVICE_CODE}/${process.env.MIXI_ENVIRONMENT_CODE}`,
  {
    headers: {
      Authorization: `Bearer ${process.env.MIXI_CONFIG_TOKEN}`,
    },
  },
);

if (!response.ok) {
  throw new Error(`Mixi Config request failed: ${response.status}`);
}

const config = await response.json();
```

## Integration Notes For AI Agents

- Read configuration through the runtime endpoint instead of hardcoding environment-specific values.
- Keep `MIXI_CONFIG_TOKEN` in the target service secret store.
- Load config during service startup and refresh it when your service needs updated values.
- Treat the response as a key-value object.
- Do not log secret config values.

## Expected Response Shape

```json
{
  "DB_HOST": "localhost",
  "DB_PORT": "5432"
}
```
