# Account (self-service)

| Field        | Value       |
| ------------ | ----------- |
| Last updated | 2026-10-24  |
| Version      | 0.1.0       |
| Status       | Implemented |

## Goal

Let the signed-in user change their password and manage their own sessions.

## Routes (shell, `requiresAuth`)

| Path                       | Name                      | View                 |
| -------------------------- | ------------------------- | -------------------- |
| `/account/change-password` | `account-change-password` | `ChangePasswordView` |
| `/account/sessions`        | `account-sessions`        | `SessionsView`       |

## Expected behavior

- **Change password:** current + new + confirm. The backend revokes every session and returns a fresh one (new cookies + `csrfToken`); the store is updated and remote queries are invalidated. When `mustChangePassword` was set, the user is sent to `/` afterwards. Wrong current password (`400 AUTH_INVALID_CREDENTIALS`) is shown on the field.
- **Forced change:** while `mustChangePassword` is true the guard only allows this route (logout stays available in the header); the navigation drawer is hidden.
- **Sessions:** lists own sessions (user agent, IP, last activity, creation, expiry). Other sessions can be closed (ConfirmDialog). The current one is marked; “Cerrar todas” calls `logout-all` and returns to login.

## Components

`PageHeader`, `PasswordField`, `ConfirmDialog`, `EmptyState`, `ErrorState`.

## Composables

- `useChangePasswordMutation`, `useLogoutAllMutation` (auth feature)
- `useSessionsQuery`, `useRevokeSessionMutation` (`composables/useSessions.ts`)

## Services / endpoints

| Function         | Endpoint                            |
| ---------------- | ----------------------------------- |
| `changePassword` | `POST /api/v1/auth/change-password` |
| `listSessions`   | `GET /api/v1/auth/sessions`         |
| `revokeSession`  | `DELETE /api/v1/auth/sessions/{id}` |
| `logoutAll`      | `POST /api/v1/auth/logout-all`      |

## Validations

`changePasswordSchema`: policy on the new password, confirmation match, new ≠ current.

## Permissions

Any authenticated user (own sessions). Listing/revoking other users' sessions (`auth.sessions_*`) is not exposed in the UI yet.

## Tests

- Unit: `password.schema.spec.ts`, `auth.store.spec.ts`
- E2E: covered indirectly by the logout flow; no dedicated E2E yet.
