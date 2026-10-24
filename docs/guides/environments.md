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

| Variable                    | Role                               |
| --------------------------- | ---------------------------------- |
| `VITE_APP_TITLE`            | Document title prefix              |
| `VITE_API_BASE_URL`         | Axios base URL                     |
| `VITE_API_TIMEOUT_MS`       | Request timeout                    |
| `VITE_API_WITH_CREDENTIALS` | Cookie credentials for future auth |
| `VITE_ENABLE_HEALTH_CHECK`  | Optional `GET /health` probe       |

**Never** put secrets in `VITE_*` — they are embedded in the client bundle.

## Netlify

`netlify.toml` defines build/publish and SPA fallback. Do not connect the site until a later stage.
