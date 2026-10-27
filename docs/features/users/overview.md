# Users

| Field        | Value       |
| ------------ | ----------- |
| Last updated | 2026-10-24  |
| Version      | 0.1.0       |
| Status       | Implemented |

## Goal

Administer CRM accounts: list, search, filter, create, edit, change status and send activation/reset links.

## Route

`/users` → `users` (`meta.permissions: ['users.read']`).

## Expected behavior

- Server-side table (`v-data-table-server`) with offset pagination (`limit` 10/25/50/100, `offset`), search `q` (debounced 300 ms, max 100 chars), filters `status` and `roleId` (role filter only when the user can read roles).
- Columns: name + username + email, role, status (`StatusBadge`), last login, actions menu.
- **Create** (`users.create`): first/last name, email, role → user is created `PENDING`; the backend sends an activation link through its notification port (no link is shown in the UI).
- **Edit** (`users.update`): sends only changed fields. Own role is locked (backend forbids self role changes). Username stays read-only and stable. Role changes revoke sessions; email edits invalidate old activation/reset links and preserve sessions.
- **Status** (`users.update_status`): Reactivar / Suspender / Deshabilitar through `ConfirmDialog`. `PENDING` users cannot be set to `ACTIVE` (they must activate). Hidden for the current user.
- **Password link** (`users.reset_password`): “Reenviar activación” (PENDING) or “Enviar restablecimiento” (ACTIVE) with confirmation. Success copy says the request was registered — it does not claim delivery.
- Backend `409` details (e.g. last SUPER_ADMIN) are shown in the dialog.

## Components

- Feature-local: `UserFormDialog`
- Global: `PageHeader`, `StatusBadge`, `ConfirmDialog`, `EmptyState`, `ErrorState`

## Composables / utils

- `useUsersQuery`, `useCreateUserMutation`, `useUpdateUserMutation`, `useUpdateUserStatusMutation`, `useRequestUserPasswordResetMutation`
- `useRolesQuery` (roles feature) for role select/filter
- `utils/user-actions.ts`: `availableStatusTargets`, `canSendPasswordLink`

## Services / endpoints

| Function                   | Endpoint                                 |
| -------------------------- | ---------------------------------------- |
| `listUsers`                | `GET /api/v1/users`                      |
| `createUser`               | `POST /api/v1/users`                     |
| `updateUser`               | `PATCH /api/v1/users/{id}`               |
| `updateUserStatus`         | `PATCH /api/v1/users/{id}/status`        |
| `requestUserPasswordReset` | `POST /api/v1/users/{id}/reset-password` |
| `getUser`                  | `GET /api/v1/users/{id}` (service only)  |

## Validations

`userFormSchema`: names 1–100 chars, valid email, role required. Backend field errors (`errors[]`) are mapped onto the form.

## Permissions

`users.read` (route), `users.create`, `users.update`, `users.update_status`, `users.reset_password` (actions). Data scope is applied by the backend (SUPERVISOR sees team users only).

## Tests

- Unit: `tests/unit/feature-utils.spec.ts` (user actions)
- E2E: `tests/e2e/users.spec.ts` (mocked list)

## Pending

- Soft delete (`DELETE /api/v1/users/{id}`) is not exposed in the UI.
- User detail page.

## Login username

Creation shows a read-only preview from first initial + complete surname (NFD → lowercase ASCII letters/digits). The API resolves collisions and the success message displays the actual assigned username including any suffix. Edit shows the saved username; name/email edits do not regenerate it. The list displays username separately from email and search matches both. The shell user menu displays the current username. Generated OpenAPI `UserDto`/`AuthUserDto` are the source of truth.
