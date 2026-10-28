# Environments

## Supported

| Name        | Purpose                                 |
| ----------- | --------------------------------------- |
| Development | Local Vite (`pnpm dev`)                 |
| Production  | Static build for Netlify (`pnpm build`) |

## Templates

- `.env.example`
- `.env.development.example`
- `.env.production.example`

Vite loads `.env`, `.env.local`, `.env.[mode]`. Never commit real `.env` files.

## Variables

| Variable                                   | Role                               |
| ------------------------------------------ | ---------------------------------- |
| `VITE_APP_TITLE`                           | Document title prefix              |
| `VITE_API_BASE_URL`                        | openapi-fetch `baseUrl`            |
| `VITE_API_TIMEOUT_MS` / `VITE_API_TIMEOUT` | Request timeout (ms)               |
| `VITE_API_WITH_CREDENTIALS`                | Cookie credentials for future auth |
| `VITE_ENABLE_HEALTH_CHECK`                 | Optional `GET /health` probe       |

**Never** put secrets in `VITE_*` — they are embedded in the client bundle.

## Netlify

For temporary access to the local CRM from other PCs, see
[Temporary local sharing](local-sharing.md). The dedicated `share` mode uses a
same-origin API proxy and a separate build directory.

`netlify.toml` defines build/publish and SPA fallback. Do not connect the site until a later stage.
