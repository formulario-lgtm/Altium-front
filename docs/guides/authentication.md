# Authentication (frontend)

How the SPA integrates with the Altium-back cookie-session auth (backend: `Altium-back/docs/guides/authentication.md`, ADR 0004).

## Overview

```text
LoginView ──login()──▶ POST /api/v1/auth/login
                       ◀── Set-Cookie altium_session (HttpOnly) + altium_csrf
                       ◀── body { user, permissions, session, csrfToken }
auth.service: setCsrfToken(csrfToken)    (memory)
auth.store:   setSession(body)           (Pinia, memory)

Any POST/PUT/PATCH/DELETE ──▶ client middleware adds x-csrf-token
Any 401 (non-public route) ──▶ clear CSRF ─▶ onUnauthorized handlers ─▶ clear store + Query ─▶ /login?redirect=
```

## Where state lives

| Data                         | Location                                      | Persisted?                       |
| ---------------------------- | --------------------------------------------- | -------------------------------- |
| Session cookie               | Browser (`altium_session`, HttpOnly)          | Cookie only, unreadable by JS    |
| CSRF token                   | `src/services/http/csrf.ts` (module memory)   | No                               |
| User, permissions, session   | `src/stores/auth.store.ts` (Pinia)            | No                               |
| Remote lists (users, teams…) | TanStack Query cache                          | No (cleared on login/logout/401) |
| Remembered email             | `localStorage['altium.auth.rememberedEmail']` | Yes — email only, opt-in         |
| Theme                        | `localStorage['altium.ui.theme']`             | Yes                              |

Never store passwords, tokens, cookies or session data in `localStorage`/`sessionStorage`. `GET /auth/me` is **not** cached in Query to avoid duplicating the store.

## CSRF

- Header `x-csrf-token` (`CSRF_HEADER`) on mutating methods, taken from memory; fallback: readable cookie `altium_csrf` when the API shares the site.
- Captured from login/password-change responses; session boot applies the `GET /auth/me` token in `auth.store.setSession()` only after checking that the probe is current. A late boot response cannot overwrite a newer login's token.
- The OpenAPI contract declares the header as required, so services pass `params: { header: csrfHeaders() }`; the middleware overwrites it with the current token.
- Public routes (`login`, `forgot-password`, `reset-password`, `activate`) do not need it.

## Boot and guards

`src/app/router/guards.ts`:

1. `beforeEach` awaits `auth.ensureSession()` — one `GET /auth/me` per page load (concurrent calls share the promise). `401` → unauthenticated; network errors set `bootError` (shown on login). An in-flight boot `me()` must not clear a session established by a concurrent login (`setSession` bumps an epoch so stale 401s are ignored).
2. `resolveAuthNavigation(to, auth)` (pure, unit-tested):
   - `meta.public` → allow.
   - `meta.guestOnly` + authenticated → `/` (or change-password).
   - `meta.requiresAuth` + not authenticated → `/login?redirect=<fullPath>`.
   - `mustChangePassword` → only `account-change-password` (logout remains in the header).
   - `meta.permissions` (all required) missing → `/forbidden`.
3. `sanitizeRedirect` accepts only internal absolute paths (no `//host`, no `/login` loops).

## 401 handling

`onUnauthorized(handler)` (exported by `services/http`) is registered in `src/app/session.ts`:

- Always: clear store + CSRF + Query cache.
- Redirect to `/login?redirect=…&reason=expired` **only** if the user was authenticated and is not already on a guest page — avoids loops during boot (`me` → 401) and on login failures (login 401 is exempt in the middleware).
- Each outgoing request captures an in-memory session version (`services/http/session-version.ts`). `setSession` and `clearSession` advance it; a 401 from a previous version still fails its original request but cannot clear the current CSRF/session or trigger another redirect. This also prevents several old 401s from repeatedly clearing Query during re-login.
- `createTimedFetch` merges the timeout signal with cancellation from both a `Request` object and `RequestInit`. Query cancellation on logout/expiry therefore aborts pending native fetches and releases the global loading overlay, including on the login page. Pending calls cannot keep the redirect login blocked until timeout after the API restarts.

## Logout

`useLogoutMutation` / `useLogoutAllMutation` clear local state and navigate to `/login` on settle, even if the API call fails.

## Password policy

`passwordPolicySchema` mirrors the backend: 12–128 chars, uppercase, lowercase, digit. Login does not enforce it.

## Email delivery (pending)

The backend has **no email provider** yet: `NOTIFICATION_MODE=console_dev` (development outbox file) or `noop` (production). The UI therefore never claims that an email was sent:

- Forgot password: neutral “Si el correo está registrado, recibirás instrucciones…”.
- Admin “send link”: “Solicitud registrada…”.

In development, read links with `pnpm auth:dev-token` in Altium-back.

## Local development

- Backend CORS must allow the SPA origin with credentials; cookies use `SameSite=lax` on `localhost`.
- If SPA and API run on different sites in production, the backend needs `SameSite=none; Secure` and the SPA relies on the body `csrfToken` (cookie fallback will not be readable).

## Tests

- Unit: `csrf.spec.ts`, `client.spec.ts` (CSRF header, 401 hook), `auth.store.spec.ts`, `guards.spec.ts`
- E2E: `tests/e2e/auth.spec.ts` with mocked API (`tests/e2e/support/api-mock.ts`)
