# Architecture overview

## Style

Altium CRM frontend is a **feature-oriented SPA**: Vue 3 + Vite, Vuetify for UI, Pinia for app state, TanStack Query for server state, Axios for HTTP.

## Boundaries

| Concern              | Location             | Rules                                      |
| -------------------- | -------------------- | ------------------------------------------ |
| Screens / feature UI | `src/features/*`     | Own views, local components, composables   |
| Shared UI            | `src/components/*`   | Only when reused across features           |
| Layouts              | `src/layouts/`       | App chrome                                 |
| HTTP                 | `src/services/http/` | Single Axios instance + domain services    |
| App state            | `src/stores/`        | Theme, session shell (future), UI prefs    |
| Remote state         | TanStack Query       | Cache, retries, loading/error for API data |
| Config               | `src/config/`        | Env-derived settings                       |

## Data flow

1. Views/composables call services or Query hooks.
2. Services call `httpClient` — never raw Axios in components.
3. Query cache holds remote entities; Pinia holds cross-cutting UI/app state only.

## Extension points

- Auth/session (cookie-based with backend) — not implemented.
- Feature modules (customers, opportunities, dashboard).
- Form validation (VeeValidate + Zod) and charts (ECharts) when first needed.
- Netlify deploy using `netlify.toml`.
