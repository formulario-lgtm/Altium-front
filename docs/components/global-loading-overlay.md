# GlobalLoadingOverlay

| Field        | Value       |
| ------------ | ----------- |
| Last updated | 2026-10-25  |
| Version      | 0.1.0       |
| Status       | Implemented |

Full-screen blocking loader while the app waits on the backend.

## Purpose

- Show a consistent “Cargando…” state (glass card + primary spinner).
- Block further clicks/keyboard interaction (`v-overlay` persistent).
- Avoid the empty/frozen look when a request takes noticeable time.

## Code location

`src/components/common/GlobalLoadingOverlay.vue`

Mounted once in `AppShellLayout` and `AuthLayout` (inside `v-app` for theme tokens).

## How it turns on

The openapi-fetch client middleware in `src/services/http/client.ts` calls `beginGlobalLoading` / `endGlobalLoading` (`src/services/http/loading.ts`) for every tracked request. Multipart document upload (raw `fetch`) does the same in `try/finally`.

**Silent (no overlay):** `GET /api/v1/notifications/unread-count`, `GET /health` — background polls must not freeze the shell.

**Show delay:** ~180 ms so fast responses do not flash the overlay.

## Manual use

```ts
import { beginGlobalLoading, endGlobalLoading } from '@/services/http';

beginGlobalLoading();
try {
  await customBackendWork();
} finally {
  endGlobalLoading();
}
```

Prefer going through `apiClient` so tracking is automatic.

## Design

Uses `--altium-glass`, `--altium-glass-border`, `--altium-card-shadow`, and Vuetify `primary` progress — no one-off palette.
