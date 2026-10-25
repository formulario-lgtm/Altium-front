# Home

| Field        | Value       |
| ------------ | ----------- |
| Last updated | 2026-10-24  |
| Version      | 0.1.0       |
| Status       | Implemented |

## Goal

Simple landing page after login: greeting, current user + role, and quick links to the modules the role can open. **No KPIs or charts** (no CRM data exists yet).

## Route

`/` → `home` (shell, `requiresAuth`).

## Expected behavior

- Shows `Hola, {firstName}`, full name, email and role code.
- Quick links = navigation items filtered by route permissions (see [app-navigation](../../components/app-navigation.md)). Roles without admin permissions see an explanatory message.
- Secondary links: own sessions and system status (`/system`).

## Data

Reads the auth store only (no extra requests).

## Tests

E2E: `tests/e2e/auth.spec.ts` (“home shows quick links filtered by permissions”).
