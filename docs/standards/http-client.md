# HTTP client standards

## Stack

- **Transport:** native `fetch` via [`openapi-fetch`](https://openapi-ts.dev/openapi-fetch/)
- **Types:** `openapi-typescript` → `src/types/generated/api.ts`
- **Remote state:** TanStack Vue Query (not Pinia)

## Rules

1. All HTTP goes through `apiClient` / feature services under `src/services/http/`.
2. Prefer generated `paths` types — never hand-duplicate backend DTOs.
3. Use `parseApiResult()` so 4xx/5xx become thrown `ApiError` values for Query.
4. Errors are normalized to Problem Details–aware `ApiError` (RFC 9457).
5. `credentials: 'include'` when `VITE_API_WITH_CREDENTIALS=true` (future HttpOnly cookies).
6. Timeouts use `AbortController` (`createTimedFetch`); Query may pass its own `signal` for cancellation.
7. Send `x-request-id` on every request (middleware). Prepare CSRF header wiring when cookie auth lands.
8. Do not store JWT/session tokens in `localStorage`.

## Env

| Variable                                   | Purpose                          |
| ------------------------------------------ | -------------------------------- |
| `VITE_API_BASE_URL`                        | `baseUrl` for openapi-fetch      |
| `VITE_API_TIMEOUT_MS` / `VITE_API_TIMEOUT` | Per-request timeout (ms)         |
| `VITE_API_WITH_CREDENTIALS`                | Maps to `credentials: 'include'` |
| `VITE_ENABLE_HEALTH_CHECK`                 | Optional `/health` probe         |

No secrets in `VITE_*` variables.

## CORS / CSRF (future auth)

- Backend must allow the frontend origin with credentials (already prepared via CORS env).
- When sessions use cookies, add CSRF double-submit / header checks on mutating routes.
- Frontend middleware placeholder lives in `src/services/http/client.ts` (`x-csrf-token`).
