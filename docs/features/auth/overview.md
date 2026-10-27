# Auth (guest screens)

| Field        | Value       |
| ------------ | ----------- |
| Last updated | 2026-10-25  |
| Version      | 0.1.0       |
| Status       | Implemented |

## Goal

Sign in, password recovery and account activation against the Altium-back cookie-session API. Session handling is described in [guides/authentication.md](../../guides/authentication.md).

## Routes (layout `AuthLayout`, `meta.guestOnly`)

| Path                       | Name              | View                 |
| -------------------------- | ----------------- | -------------------- |
| `/login?redirect=&reason=` | `login`           | `LoginView`          |
| `/forgot-password`         | `forgot-password` | `ForgotPasswordView` |
| `/reset-password?token=`   | `reset-password`  | `ResetPasswordView`  |
| `/activate?token=`         | `activate`        | `ActivateView`       |

Authenticated users opening these routes are sent to `/` (or to change-password when `mustChangePassword`).

## Expected behavior

- Session recovery keeps the current tab usable: old requests are cancelled when the session expires, old-session 401s cannot invalidate a new login, and a failed login during an API outage can be retried with the same `redirect` URL after connectivity returns. Stale boot probes cannot replace the current CSRF token.
- **Login:** username + password (+ “Recordar mi usuario”). On success the store is filled from the response; navigation goes to the sanitized `redirect` query (internal paths only) or `/`. If `user.mustChangePassword`, goes to `/account/change-password`.
- **Forgot password:** always shows the same neutral message (“Si el correo está registrado, recibirás instrucciones…”). It never claims the email was delivered — the backend answers 200 regardless and **no email provider exists yet** (`console_dev` in development, `noop` in production). Only transport/validation/rate-limit errors are shown.
- **Reset / activate:** read `?token=`; missing token shows a warning with next steps. On success → `/login?reason=password-set`. Invalid/expired token → `AUTH_TOKEN_INVALID` message.

## UI shell

`AuthLayout` is a split guest shell: brand panel (headline + highlights) on desktop, glass auth card on the right (theme toggle inside). Atmosphere (orbs/dots) follows light/dark tokens. Mobile stacks the mark + card.

## Components

- Feature-local: `LoginForm`, `SetPasswordForm` (new + confirm password, shared by reset and activate).
- Global: `PasswordField`, `ThemeToggleButton`, `AltiumMark` (provisional mark, not a final logo).

## Composables

- `useLoginMutation`, `useForgotPasswordMutation`, `useResetPasswordMutation`, `useActivateAccountMutation` (`composables/useAuthMutations.ts`)
- `useTokenFromQuery`
- Utils: `remembered-username.ts` (`altium.auth.rememberedUsername` — username only)

## Services / endpoints

| Function          | Endpoint                            |
| ----------------- | ----------------------------------- |
| `login`           | `POST /api/v1/auth/login`           |
| `forgotPassword`  | `POST /api/v1/auth/forgot-password` |
| `resetPassword`   | `POST /api/v1/auth/reset-password`  |
| `activateAccount` | `POST /api/v1/auth/activate`        |

## Validations (VeeValidate + Zod)

- `loginSchema`: ASCII username (trimmed/lowercase, 1–100 letters/digits), non-empty password. **No policy on login** (matches backend).
- `forgotPasswordSchema`: valid email.
- `setPasswordSchema` / `passwordPolicySchema`: 12–128 chars, ≥1 uppercase, ≥1 lowercase, ≥1 digit; confirmation must match.

## Loading / empty / error

Buttons show loading; errors via `apiErrorMessage` (Spanish copy for `AUTH_*` codes: invalid credentials, pending/suspended/disabled account, rate limit, invalid token).

## Permissions

None (public routes, rate limited by the backend).

## Tests

- Unit: `tests/unit/LoginForm.spec.ts`, `src/features/auth/schemas/password.schema.spec.ts`, `tests/unit/PasswordField.spec.ts`, `tests/unit/feature-utils.spec.ts` (remembered username)
- E2E: `tests/e2e/auth.spec.ts` (redirect, login success/failure, logout)

## Limitations

- Email delivery is pending in the backend; activation/reset links are only visible in the dev outbox (`pnpm auth:dev-token` in Altium-back).
- No MFA / CAPTCHA.

## Theme transitions

Auth-layout and login-button light overrides use scoped descendant selectors (`.v-theme--light .auth-stage`, etc.). Do not prefix a descendant with a standalone `:global(...)`: Vue can compile that into a rule targeting the theme root, applying decorative opacity/background to the entire application. Light/dark changes must update both Vuetify and local auth variables; the application root stays fully opaque. `system-status.spec.ts` verifies both directions, light-theme reload persistence, actual colors and root opacity on desktop/mobile.

## Stable username login

The login username field has no example placeholder; its label identifies the input without overlapping validation feedback.

Email is contact/recovery data, not a login credential. The API assigns a stable initial + surname username (`Ariel Pérez` → `aperez`, duplicates `aperez2`, etc.). Login rejects email addresses and remembers only an opt-in username. The obsolete remembered-email preference is removed rather than guessed into a username. Forgot-password still asks for the current contact email. Existing accounts retain passwords and sessions after the backend migration; no email fallback login remains.

## Login loading lifecycle

The local submit guard stays pending through the HTTP call, session update, awaited navigation and first render. Duplicate submits are ignored and the button says “Ingresando…”. An explicit global task covers the gap after the login response; navigation/import/API tasks overlap until the destination is ready. Failures release the blocker and retain a retryable form. See [GlobalLoadingOverlay](../../components/global-loading-overlay.md) and `tests/e2e/global-loading.spec.ts`.
