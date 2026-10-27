# AGENTS.md — Altium CRM Frontend

Entry point for Codex and Cursor. Keep this file short; follow linked docs for detail.

## Purpose

Single-tenant enterprise CRM UI for Altium (~20 users initially). Talks to a NestJS + Fastify REST API. Hosting target: Netlify (not connected yet).

This repository contains the technical foundations plus **Stage 5: authentication (cookie session + CSRF), own account, users, teams, roles/permissions and audit**, **sales UI (Mis ventas / nueva venta / detalle)**, **administrative UI (gestión de ventas, revisión, seguimientos, observaciones, notificaciones in-app)**, **supervision UI (vendedores, administrativos, objetivos mensuales + ECharts)**, and **role-specific Home (`/api/v1/home/*`)** against the Nest API. Other commercial CRM screens (customers, opportunities, generic BI dashboards) are not in scope yet.

## Stack

| Area         | Choice                                          |
| ------------ | ----------------------------------------------- |
| Framework    | Vue 3 (`<script setup>` + Composition API)      |
| Build        | Vite                                            |
| UI           | Vuetify 3 + MDI                                 |
| Routing      | Vue Router                                      |
| App state    | Pinia                                           |
| Server state | TanStack Vue Query                              |
| HTTP         | `openapi-fetch` (native fetch) + typed paths    |
| API contract | `contracts/openapi.json` + `openapi-typescript` |
| Forms        | VeeValidate + Zod (`@vee-validate/zod`)         |
| Tests        | Vitest + Vue Test Utils; Playwright E2E         |
| Tooling      | TypeScript strict, ESLint, Prettier, pnpm       |

**Deferred (documented, not installed):** AG Grid. See ADR `0002` (amended: VeeValidate + Zod in Stage 5; Apache ECharts in supervision).

Auth/session: [docs/guides/authentication.md](docs/guides/authentication.md).

**Design system (mandatory):** [docs/architecture/visual-identity.md](docs/architecture/visual-identity.md), [docs/standards/ui-ux.md](docs/standards/ui-ux.md). Tokens `src/styles/tokens.ts` → Vuetify themes/defaults `src/app/plugins/vuetify.ts` → shell `src/styles/main.scss` + forms `src/styles/forms.scss`. Shared UI in `src/components/common` + `src/components/layout` (see `docs/components/`). **Never** hardcode palette hex, duplicate button/badge/table/input skins, or invent a second look per feature — extend the system so light and dark stay consistent.

Contract sync: [docs/architecture/api-integration.md](docs/architecture/api-integration.md), [docs/guides/openapi-types.md](docs/guides/openapi-types.md).

## Architecture

- Feature-based modules under `src/features/`.
- Shared UI in `src/components/` (`common` / `layout`) — document globals in `docs/components/`.
- HTTP only via `src/services/http/` (`openapi-fetch`) — never call `fetch`/`apiClient` from presentational components.
- Pinia = shared app/UI state. TanStack Query = remote data. Do not duplicate the same data in both.
- Layouts in `src/layouts/`. App wiring in `src/app/`.

Details: [docs/architecture/overview.md](docs/architecture/overview.md), [docs/architecture/project-structure.md](docs/architecture/project-structure.md).

## Folder map

```text
src/app/          # plugins, router
src/components/   # reusable UI (document globals in docs/components/)
src/composables/  # shared composables
src/config/       # env / app config
src/features/     # feature modules (views, local components, composables)
src/layouts/      # shell layouts
src/services/http # openapi-fetch client + API services
src/types/generated # OpenAPI types (do not edit)
src/stores/       # Pinia
src/styles/       # theme tokens / global SCSS
contracts/        # vendored openapi.json from Altium-back
docs/features/    # feature Markdown (mandatory)
docs/components/  # global component Markdown
```

## Coding rules

- English for code, files, routes, technical docs. Business copy may be Spanish.
- No source file > **1000** lines; prefer **300–500**.
- No `any` / `@ts-ignore` without a one-line justification.
- Prefer Vuetify primitives + design-system defaults over custom widgets.
- Reuse `PageHeader`, `StatusBadge`, `UserAvatar`, `ConfirmDialog`, `EmptyState`, `ErrorState`, `altium-filters`, and shell layout patterns on every new screen.
- Lazy-load route components. Keep views thin; move logic to composables/services.
- **No blank first-load on lazy routes:** every new `<v-*>` must be mapped and listed in `scripts/vuetify-optimize-deps.ts` (Vite `optimizeDeps`). Missing entries cause a white screen / full reload on first navigation (list, detalle, nueva venta, admin, …). Enforced by `pnpm check:vuetify-deps`. Prefer components already in that list; never introduce `VTimeline` / heavy one-offs without updating the list.

Full standards: [docs/standards/coding-standards.md](docs/standards/coding-standards.md), [docs/standards/components.md](docs/standards/components.md), [docs/standards/ui-ux.md](docs/standards/ui-ux.md).

## HTTP & security

- Base URL, AbortController timeout, `credentials: 'include'` from `VITE_*` env.
- Use `openapi-fetch` + generated OpenAPI types; do not invent backend DTOs.
- Never manually edit `src/types/generated/**`. Do not reintroduce Axios.
- Central Problem Details mapping; `apiErrorMessage()` for user-facing copy.
- Cookie session (`altium_session`, HttpOnly) + CSRF double submit: `x-csrf-token` on mutating calls from the in-memory store `src/services/http/csrf.ts` (fallback: `altium_csrf` cookie). 401 → `onUnauthorized` hook clears session and redirects to `/login`.
- Session state in `src/stores/auth.store.ts` (Pinia, memory only). Routes use `meta.requiresAuth` / `guestOnly` / `permissions` (`src/app/router/guards.ts`).
- No JWT/session/CSRF/password in `localStorage` (only theme and opt-in remembered username `altium.auth.rememberedUsername`). No secrets in `VITE_*`.
- Optional `/health` probe behind `VITE_ENABLE_HEALTH_CHECK` — UI must run without API.
- Keep HTTP out of presentational components.

## Testing

- Unit: Vitest + VTU (`*.spec.ts`).
- E2E: Playwright (`tests/e2e`) with typed API mocks (`tests/e2e/support/api-mock.ts`) — no live backend.
- New behavior ships with tests in the same task.

See [docs/standards/testing.md](docs/standards/testing.md).

## Documentation

1. New/changed features → `docs/features/<feature>/` in the same task.
2. New global reusable components → `docs/components/<name>.md`.
3. Update indexes (`docs/features/README.md`, etc.).
4. Update `CHANGELOG.md` (`Unreleased`).
5. Agents load only docs relevant to the task.

See [docs/standards/documentation.md](docs/standards/documentation.md).

## Versioning

SemVer. Current: **0.1.0**. Keep a Changelog with Spanish section headings in `CHANGELOG.md`. No tags/releases without explicit user approval.

## Git policy (strict)

- **Never** `git commit`, `git push`, tag, or change remotes unless the user explicitly asks.
- Commit authorization ≠ push authorization.
- Before a requested commit: `pnpm check`, confirm docs/CHANGELOG, no secrets, report results.

See [docs/standards/git-workflow.md](docs/standards/git-workflow.md).

## Environments

- `development` (current focus) and `production`.
- Templates: `.env.example`, `.env.development.example`, `.env.production.example`.
- Netlify prep via `netlify.toml` — do not connect infra yet.

See [docs/guides/environments.md](docs/guides/environments.md).

## Validation commands

```bash
pnpm dev
pnpm build
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm test:coverage
pnpm test:e2e          # requires: pnpm exec playwright install
pnpm docs:check
pnpm check:lines
pnpm check:vuetify-deps
pnpm api:generate
pnpm api:check
pnpm check             # includes api:check + check:vuetify-deps
```

## Agent workflow

1. Read this file.
2. Open only related feature/component docs and code.
3. Design the smallest correct change.
4. Implement + tests + Markdown + CHANGELOG.
5. If the backend contract changed: sync `contracts/openapi.json` then `pnpm api:generate`.
6. Run `pnpm check` (and `pnpm test:e2e` when UI flows change).
7. Report files and results.
8. No commit/push without explicit authorization.
9. No unrelated refactors; no unjustified new dependencies.

## Scope boundaries

**In scope now:** Vite/Vue/Vuetify bootstrap, themes, OpenAPI-typed HTTP client, optional health probe, tooling, docs, CI, **Stage 5**: login/forgot/reset/activate, guards + RBAC navigation, own account (password, sessions), users, teams, roles/permissions, audit, **sales (Mis ventas)**: list/filters, draft form with conditional sections, autosave + version conflict, submit (`sales.update`), return (`sales.return`), Excel export (`sales.read`), document upload/download/delete via Spaces, **administrative**: sales review queue/detail, follow-ups, observations, in-app notifications, **supervision**: sellers/administratives analytics, monthly goals (`supervision.analytics.read` / `supervision.goals.manage`), **home by role** (`home.seller|administrative|supervisor|admin.read` → `GET /api/v1/home/*`).

**Out of scope now:** Other commercial CRM modules (customers, opportunities, generic BI dashboards), Netlify connection, AG Grid, MFA, payment tokenization / CBU capture, email/push notifications, assignment-admin UI.
