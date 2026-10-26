# Supervision (SUPERVISOR)

| Field        | Value       |
| ------------ | ----------- |
| Last updated | 2026-10-25  |
| Version      | 0.1.0       |
| Status       | Implemented |

## Goal

Analytical UI for SUPERVISOR (and any role with `supervision.analytics.read`): team performance, seller/administrative comparisons, monthly goals. Does **not** change sale workflow states unless the user also has administrative/sales mutation permissions (those actions stay on administrative or seller screens).

## Routes

| Path                               | Name                                | Permissions                  |
| ---------------------------------- | ----------------------------------- | ---------------------------- |
| `/` (when permitted)               | `home`                              | `home.supervisor.read`       |
| `/supervision/sellers`             | `supervision-sellers`               | `supervision.analytics.read` |
| `/supervision/sellers/:id`         | `supervision-seller-detail`         | `supervision.analytics.read` |
| `/supervision/administratives`     | `supervision-administratives`       | `supervision.analytics.read` |
| `/supervision/administratives/:id` | `supervision-administrative-detail` | `supervision.analytics.read` |
| `/supervision/goals`               | `supervision-goals`                 | `supervision.analytics.read` |

Create/edit goals also requires `supervision.goals.manage`. Navigation: **Inicio**, **Vendedores**, **Administrativos**, **Objetivos**. Admin tools (**Gestión de ventas**, **Seguimientos**) only appear if the user has `sales.review` / `sales.follow_up`.

Home priority is owned by the home feature (`home.admin|administrative|supervisor|seller.read`). Supervisor Inicio uses `GET /api/v1/home/supervisor` (embeds supervision dashboard metrics) plus sellers list for the compliance chart. See [home/overview.md](../home/overview.md).

## Screens

### Inicio (supervisor)

Filters: month, year, team. KPIs and alerts from the home endpoint; compliance-by-seller chart reuses `GET /supervision/sellers`. The standalone `SupervisionDashboardView` remains in the codebase but is no longer the default Inicio embed. Thresholds: [indicators.md](indicators.md).

### Vendedores

Search + period/team filters, comparative table (presentadas, objetivo/cumplimiento chip with icon, devoluciones, tasa, última actividad). Detail: KPIs, series, status mix, recent sales (links to `sale-detail` only with `sales.read`), no sale edits from this screen.

### Administrativos

Volume and timing metrics (gestiones, revisiones iniciadas, avg first-review hours, returns, follow-ups pending/overdue). Detail separates volume vs timing; no arbitrary ranking of “better/worse” administratives.

### Objetivos

List for period/team with actual vs target for `SALES_SUBMITTED` when seller data is available. Create/edit via `GoalFormDialog`; closed months require reason + ConfirmDialog. History drawer via `GET …/goals/{id}/history`.

## Feature components

| Component                  | Role                                              |
| -------------------------- | ------------------------------------------------- |
| `AltiumChart`              | Thin ECharts wrapper; theme from `chart-theme.ts` |
| `KpiMetricCard`            | KPI card + optional help tooltip / click          |
| `ComplianceChip`           | “Sin objetivo” / % with icon (not color-only)     |
| `SupervisionPeriodFilters` | Month / year / team                               |
| `GoalFormDialog`           | Create/patch goal + closed-period confirm         |

## Composables / HTTP

- `useSupervisionPeriod` — year/month/teamId ↔ route query
- `useSupervision*` — TanStack Query wrappers; keys under `queryKeys.supervision.*`
- `src/services/http/supervision.service.ts` — openapi-fetch only

## Permissions

| Capability           | Code                         |
| -------------------- | ---------------------------- |
| Read analytics       | `supervision.analytics.read` |
| Manage monthly goals | `supervision.goals.manage`   |

## Tests

- Unit: `src/features/supervision/utils/supervision-labels.spec.ts`, `chart-theme.spec.ts`
- E2E: `tests/e2e/supervision.spec.ts` (mocked API)

## Out of scope

Sale status transitions from this module, assignment-admin UI, email/push, inventing KPIs absent from OpenAPI.

## Text encoding

Administrative, seller and goal views use UTF-8 for accented labels and punctuation. `check:encoding` prevents invalid source bytes/replacement characters, and the supervision E2E suite asserts accented subtitles and table headings.
