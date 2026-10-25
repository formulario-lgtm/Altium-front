# Roles & permissions

| Field        | Value       |
| ------------ | ----------- |
| Last updated | 2026-10-24  |
| Version      | 0.1.0       |
| Status       | Implemented |

## Goal

Show each role's permission set grouped by resource and let authorized admins replace it. Copy and grouping follow the Altium design system (Spanish explanations; technical codes secondary).

## Route

`/roles` → `roles` (`meta.permissions: ['roles.read']`).

## Expected behavior

- Left rail: role list (Spanish name, permission count, technical code). Right: selected role detail.
- With `permissions.read`: catalog grouped by resource (Spanish group labels) with checkboxes. Each item shows a Spanish description as the primary label and the `code` as a caption.
- With `roles.update_permissions`: “Guardar cambios” in the page header when the draft differs; `ConfirmDialog` explains that the whole set is replaced and applies on the next request of live sessions.
- **SUPER_ADMIN protection:** critical permissions stay locked (checkbox disabled + lock icon) with an info alert. The backend still rejects violations with `409`.

## Components

- Feature-local: `RolePermissionsEditor`
- Global: `PageHeader`, `ConfirmDialog`, `EmptyState`, `ErrorState`

## Composables / utils

- `useRolesQuery`, `usePermissionsQuery`, `useReplaceRolePermissionsMutation`
- `utils/permissions.ts`: `groupPermissionsByResource`, `resourceLabel`, `RESOURCE_LABELS`, `isProtectedPermission`, `sameCodes`, `PROTECTED_SUPER_ADMIN_PERMISSIONS`

## Services / endpoints

| Function                 | Endpoint                             |
| ------------------------ | ------------------------------------ |
| `listRoles`              | `GET /api/v1/roles`                  |
| `listPermissions`        | `GET /api/v1/permissions`            |
| `replaceRolePermissions` | `PUT /api/v1/roles/{id}/permissions` |

Permission descriptions are seeded from `permission.codes.ts` (Spanish) and refreshed by `pnpm db:seed`.

## Permissions

`roles.read` (route), `permissions.read` (catalog), `roles.update_permissions` (save).

## Tests

Unit: `tests/unit/feature-utils.spec.ts` (grouping, protection, set equality).

## Limitations

Roles cannot be created/renamed (no endpoint).
