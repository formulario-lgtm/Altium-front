# System status

| Field        | Value                        |
| ------------ | ---------------------------- |
| Last updated | 2026-10-24                   |
| Version      | 0.1.0                        |
| Status       | Implemented (bootstrap only) |

## Goal

Provide a minimal screen to verify Vue, Vuetify, routing, theming, and optional API connectivity. Not a CRM module.

## Route

- `/` → `system-status`
- Unknown paths → not-found view

## Expected behavior

- Show app title and runtime summary.
- Toggle light/dark theme from the app bar.
- If `VITE_ENABLE_HEALTH_CHECK=true`, probe `GET {API}/health` via TanStack Query.
- UI remains usable when the API is down or the probe is disabled.

## Components

- Layout: `AppShellLayout`
- `ThemeToggleButton`
- Views: `SystemStatusView`, `NotFoundView`

## Composables / stores

- `useThemeSync`
- `useApiHealthQuery`
- `useUiStore` (theme)

## Services / endpoints

- `fetchHealth()` → `GET /health` (optional)

## Validations

None (no forms).

## Loading / empty / error

- Disabled probe: informative chip + instructions.
- Pending: “Checking API…”.
- Error: message from centralized API error mapper + Retry.
- Success: chip shows API status string.

## Permissions

None.

## Business rules

N/A — technical bootstrap screen.

## User interactions

- Theme toggle.
- Retry health check when enabled.

## Responsive

Cards stack on small screens (`cols="12"` / `md="6"`).

## Tests

- Unit: `tests/unit/ThemeToggleButton.spec.ts`, `src/stores/ui.store.spec.ts`, `src/config/env.spec.ts`
- E2E: `tests/e2e/system-status.spec.ts`
