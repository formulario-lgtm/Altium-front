# GlobalLoadingOverlay

| Field        | Value       |
| ------------ | ----------- |
| Last updated | 2026-10-27  |
| Version      | 0.1.0       |
| Status       | Implemented |

Full-screen blocking loader while the app waits on backend requests, navigation or explicit frontend work.

## Purpose

- Show a consistent “Cargando…” state (glass card + primary spinner).
- Block further clicks/keyboard interaction (`v-overlay` persistent).
- Avoid the empty/frozen look when a request takes noticeable time.

## Code location

`src/components/common/GlobalLoadingOverlay.vue`

Mounted once in `App.vue`, inside the single root `v-app`. Layout changes do not recreate or interrupt the blocker. Theme synchronization also lives at this root.

## How it turns on

The openapi-fetch client middleware in `src/services/http/client.ts` uses a `beginRequestLoading()` token and its release callback (`src/services/http/loading.ts`) for every tracked request. Multipart document upload (raw `fetch`) does the same in `try/finally`.

**Silent (no overlay):** `GET /api/v1/notifications/unread-count`, `GET /health` — background polls must not freeze the shell.

**Immediate blocking:** no delay or transition. Route content becomes native `inert` immediately, disabling mouse/touch, keyboard and focus on underlying controls. The status receives focus, a capture listener blocks keyboard shortcuts/Enter/Tab/Escape while busy, and focus cannot escape to teleported menus. Previous focus is restored if its element still exists when all tracked work finishes.

`installNavigationLoading` starts before auth guards and ends on navigation completion/error (including lazy route imports). Redirects replace the current navigation task without a loading gap; stale completions cannot unlock a newer navigation. Login holds an explicit task until session updates and `router.replace` + first render complete. Role home imports hold another task until their first render starts remote queries, preserving the blocker after navigation resolves.

Use `beginGlobalTask()` for explicit UI operations. Its returned release callback is idempotent and must run in `finally`; overlapping requests and navigation keep independent counts. The root overlay clears only when the last task finishes. Silent polls remain non-blocking.

## Manual use

```ts
import { beginGlobalTask } from '@/services/http/loading';

const release = beginGlobalTask();
try {
  await customBackendWork();
} finally {
  release();
}
```

Prefer going through `apiClient` so tracking is automatic.

## Design

Uses `--altium-glass`, `--altium-glass-border`, `--altium-card-shadow`, and Vuetify `primary` progress — no one-off palette.

HTTP loading tokens belong to the current session. Advancing/clearing the session releases stale request blockers (including uploads), while navigation/UI tasks remain active. A late response from an old session cannot decrement another task or block the next login.

## Non-blocking form work

Draft sale PATCH, document-metadata verification and dependent health-plan options use backgroundApiClient with inline loading/disabled states. It is created by the same factory as apiClient and retains credentials, CSRF, tracing, timeout and unauthorized hooks; it only omits the global loading counter. There is no request header or backend switch that bypasses security. Draft saves are action-driven and serialized, and stale-session responses cannot enter the detail cache. Foreground login/navigation/submission/upload/admin actions remain blocking. See [sales](../features/sales/overview.md#responsive-draft-workflow-2026-10-28).
