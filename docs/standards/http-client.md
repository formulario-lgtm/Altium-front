# HTTP client standards

## Stack

- **Transport:** native `fetch` via [`openapi-fetch`](https://openapi-ts.dev/openapi-fetch/)
- **Types:** `openapi-typescript` → `src/types/generated/api.ts` (aliases in `src/services/http/api-types.ts`)
- **Remote state:** TanStack Vue Query (not Pinia)

## Rules

1. All HTTP goes through `apiClient` / feature services under `src/services/http/` (`auth`, `users`, `teams`, `roles`, `audit`, `health`).
2. Prefer generated `paths` / `components['schemas']` types — never hand-duplicate backend DTOs.
3. Use `parseApiResult()` (JSON bodies) or `parseEmptyResult()` (`204`) so 4xx/5xx become thrown `ApiError` values for Query.
4. Errors are normalized to Problem Details–aware `ApiError` (RFC 9457). Show users `apiErrorMessage(error)` (Spanish copy, known `AUTH_*` codes, `409` details).
5. `credentials: 'include'` when `VITE_API_WITH_CREDENTIALS=true` (HttpOnly session cookie).
6. Timeouts use `AbortController` (`createTimedFetch`); Query passes its own `signal` for cancellation.
7. Send `x-request-id` on every request (middleware).
8. Do not store JWT/session/CSRF tokens in `localStorage`/`sessionStorage`.

## Middleware

| Middleware | Behavior                                                                                                                                                  |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tracing    | Adds `x-request-id`; maps fetch failures (network/timeout/abort) to `ApiError`                                                                            |
| Session    | Mutating methods: sets `x-csrf-token` from `getCsrfToken()`. Responses `401` (except public auth routes): clears CSRF and calls `onUnauthorized` handlers |

## CSRF (`src/services/http/csrf.ts`)

- `setCsrfToken` / `clearCsrfToken` / `getCsrfToken` — memory first, then readable cookie `altium_csrf`.
- `csrfHeaders()` satisfies the contract's required `x-csrf-token` header param in typed calls:

```ts
await apiClient.PATCH('/api/v1/users/{id}/status', {
  params: { path: { id }, header: csrfHeaders() },
  body: { status },
});
```

- Tokens arrive in the body of `login`, `GET /auth/me`, `change-password` and are stored by `auth.service.ts`.

## 401 hook

```ts
import { onUnauthorized } from '@/services/http';
const unregister = onUnauthorized(({ url }) => {
  /* clear session, redirect */
});
```

Registered once in `src/app/session.ts`. See [authentication guide](../guides/authentication.md).

## Env

| Variable                                   | Purpose                          |
| ------------------------------------------ | -------------------------------- |
| `VITE_API_BASE_URL`                        | `baseUrl` for openapi-fetch      |
| `VITE_API_TIMEOUT_MS` / `VITE_API_TIMEOUT` | Per-request timeout (ms)         |
| `VITE_API_WITH_CREDENTIALS`                | Maps to `credentials: 'include'` |
| `VITE_ENABLE_HEALTH_CHECK`                 | Optional `/health` probe         |

No secrets in `VITE_*` variables.

## CORS

The backend must allow the SPA origin with credentials (`CORS_ORIGINS`, `CORS_CREDENTIALS=true`) and expose/accept `x-csrf-token` and `x-request-id`.
