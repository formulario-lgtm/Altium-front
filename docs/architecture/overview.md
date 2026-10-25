# Architecture overview

## Style

Altium CRM frontend is a **feature-oriented SPA**: Vue 3 + Vite, Vuetify for UI, Pinia for app state, TanStack Query for server state, `openapi-fetch` for typed HTTP.

## Boundaries

| Concern              | Location             | Rules                                      |
| -------------------- | -------------------- | ------------------------------------------ |
| Screens / feature UI | `src/features/*`     | Own views, local components, composables   |
| Shared UI            | `src/components/*`   | Only when reused across features           |
| Layouts              | `src/layouts/`       | App chrome                                 |
| HTTP                 | `src/services/http/` | `openapi-fetch` client + domain services   |
| App state            | `src/stores/`        | Theme, authenticated session, UI prefs     |
| Remote state         | TanStack Query       | Cache, retries, loading/error for API data |
| Config               | `src/config/`        | Env-derived settings                       |

## Data flow

1. Views/composables call services or Query hooks.
2. Services call `apiClient` — never raw `fetch` in components.
3. Query cache holds remote entities; Pinia holds cross-cutting UI/app state only.

## Auth & admin (Stage 5)

- Cookie session + CSRF double submit, router guards and RBAC-aware navigation: [guides/authentication.md](../guides/authentication.md).
- Admin modules: users, teams, roles/permissions, audit, own account (see `docs/features/`).
- Forms: VeeValidate + Zod (ADR 0002 amendment). Visual tokens: [visual-identity.md](visual-identity.md).

## Sales (Paso 3 UI)

- Feature module `src/features/sales` against Nest sales + health-insurer endpoints.
- Seller nav: **Mis ventas** via `sales.read`; admin modules remain permission-gated.
- Drafts: autosave + `version` concurrency; documents/CBU capture pending backend storage/tokenization.
- Docs: [features/sales/overview.md](../features/sales/overview.md).

## Extension points

- Other commercial CRM modules (customers, opportunities, dashboard/KPIs).
- Document object storage upload UI once Spaces is configured; payment tokenization / CBU capture.
- Charts (ECharts) and advanced grids (AG Grid) when first needed.
- Netlify deploy using `netlify.toml`.
