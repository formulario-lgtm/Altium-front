# System status

| Field        | Value       |
| ------------ | ----------- |
| Last updated | 2026-10-24  |
| Version      | 0.1.0       |
| Status       | Implemented |

## Goal

Technical screen to verify runtime and optional API connectivity, plus the forbidden and not-found pages. Not a CRM module.

## Routes

- `/system` → `system-status` (authenticated shell)
- `/forbidden` → `forbidden` (authenticated shell; target of the permission guard)
- Unknown paths → `not-found` (`meta.public`, standalone)

## Expected behavior

- Runtime summary (framework, state libs, API base URL).
- If `VITE_ENABLE_HEALTH_CHECK=true`, probe `GET {API}/health` via TanStack Query; otherwise an informative chip.
- Forbidden: `EmptyState` with “Ir al inicio”.

## Components

`PageHeader`, `EmptyState`; views `SystemStatusView`, `ForbiddenView`, `NotFoundView`.

## Composables / stores

`useApiHealthQuery`, `useThemeSync`, `useUiStore`.

## Services / endpoints

`fetchHealth()` → `GET /health` (optional).

## Tests

- Unit: `tests/unit/ThemeToggleButton.spec.ts`, `src/stores/ui.store.spec.ts`, `src/config/env.spec.ts`
- E2E: `tests/e2e/system-status.spec.ts` (theme toggle on login, system page in shell)
