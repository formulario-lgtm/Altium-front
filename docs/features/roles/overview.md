# Roles & permissions

| Field        | Value       |
| ------------ | ----------- |
| Last updated | 2026-10-24  |
| Version      | 0.1.0       |
| Status       | Implemented |

## Goal

Show each role's permission set grouped by resource and let authorized admins replace it.

## Route

`/roles` → `roles` (`meta.permissions: ['roles.read']`).

## Expected behavior

- Left: role list (name, code, permission count). Right: permissions of the selected role.
- With `permissions.read`: full catalog grouped by `resource` with checkboxes (description as hint). Without it: the role's codes as read-only chips.
- With `roles.update_permissions`: “Guardar cambios” enabled when the draft differs; `ConfirmDialog` (warning) explains that the whole set is replaced and applies immediately to live sessions.
- **SUPER_ADMIN protection:** `users.create`, `users.update_status`, `roles.update_permissions`, `roles.read`, `permissions.read`, `audit.read` are locked (checkbox disabled + lock icon) and an info alert is shown. The backend still rejects violations with `409`.

## Components

- Feature-local: `RolePermissionsEditor`
- Global: `PageHeader`, `ConfirmDialog`, `EmptyState`, `ErrorState`

## Composables / utils

- `useRolesQuery`, `usePermissionsQuery`, `useReplaceRolePermissionsMutation`
- `utils/permissions.ts`: `groupPermissionsByResource`, `isProtectedPermission`, `sameCodes`, `PROTECTED_SUPER_ADMIN_PERMISSIONS`

## Services / endpoints

| Function                 | Endpoint                             |
| ------------------------ | ------------------------------------ |
| `listRoles`              | `GET /api/v1/roles`                  |
| `listPermissions`        | `GET /api/v1/permissions`            |
| `replaceRolePermissions` | `PUT /api/v1/roles/{id}/permissions` |

## Permissions

`roles.read` (route), `permissions.read` (catalog), `roles.update_permissions` (save).

## Tests

Unit: `tests/unit/feature-utils.spec.ts` (grouping, protection, set equality).

## Limitations

Roles cannot be created/renamed (no endpoint).
