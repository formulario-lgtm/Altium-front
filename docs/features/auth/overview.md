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
- **Login:** email + password (+ “Recordar mi correo”). On success the store is filled from the response; navigation goes to the sanitized `redirect` query (internal paths only) or `/`. If `user.mustChangePassword`, goes to `/account/change-password`.
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
- Utils: `remembered-email.ts` (`altium.auth.rememberedEmail` — email only)

## Services / endpoints

| Function          | Endpoint                            |
| ----------------- | ----------------------------------- |
| `login`           | `POST /api/v1/auth/login`           |
| `forgotPassword`  | `POST /api/v1/auth/forgot-password` |
| `resetPassword`   | `POST /api/v1/auth/reset-password`  |
| `activateAccount` | `POST /api/v1/auth/activate`        |

## Validations (VeeValidate + Zod)

- `loginSchema`: valid email (trimmed), non-empty password. **No policy on login** (matches backend).
- `forgotPasswordSchema`: valid email.
- `setPasswordSchema` / `passwordPolicySchema`: 12–128 chars, ≥1 uppercase, ≥1 lowercase, ≥1 digit; confirmation must match.

## Loading / empty / error

Buttons show loading; errors via `apiErrorMessage` (Spanish copy for `AUTH_*` codes: invalid credentials, pending/suspended/disabled account, rate limit, invalid token).

## Permissions

None (public routes, rate limited by the backend).

## Tests

- Unit: `tests/unit/LoginForm.spec.ts`, `src/features/auth/schemas/password.schema.spec.ts`, `tests/unit/PasswordField.spec.ts`, `tests/unit/feature-utils.spec.ts` (remembered email)
- E2E: `tests/e2e/auth.spec.ts` (redirect, login success/failure, logout)

## Limitations

- Email delivery is pending in the backend; activation/reset links are only visible in the dev outbox (`pnpm auth:dev-token` in Altium-back).
- No MFA / CAPTCHA.
