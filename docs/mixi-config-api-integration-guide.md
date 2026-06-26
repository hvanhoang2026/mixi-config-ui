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
- `{MIXI_CONFIG_TOKEN}` with the server-side runtime config token configured in `mixi-config-api`.
- Frontend service type can call this endpoint without `MIXI_CONFIG_TOKEN`.
- Non-frontend service types must send `MIXI_CONFIG_TOKEN`.

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

For frontend service type:

```bash
curl "$MIXI_CONFIG_API_URL/runtime-config/$MIXI_SERVICE_CODE/$MIXI_ENVIRONMENT_CODE"
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
- Frontend service type can fetch runtime config without `MIXI_CONFIG_TOKEN`.
- Keep `MIXI_CONFIG_TOKEN` in the target service secret store for non-frontend service types.
- Do not expose `MIXI_CONFIG_TOKEN` in browser code or public frontend environment variables.
- Load config during service startup and refresh it when your service needs updated values.
- Treat the response as a key-value object.
- Do not log secret config values.

## API Protection

`mixi-config-api` rejects runtime config requests when:

- The requested service is not type `frontend` and the server has no `MIXI_CONFIG_TOKEN` configured.
- The requested service is not type `frontend` and the request omits the token.
- The requested service is not type `frontend` and the request sends an invalid token.

Send the token with either `Authorization: Bearer {MIXI_CONFIG_TOKEN}` or `x-config-token: {MIXI_CONFIG_TOKEN}`.

## Expected Response Shape

```json
{
  "DB_HOST": "localhost",
  "DB_PORT": "5432"
}
```
