# Home

| Field        | Value       |
| ------------ | ----------- |
| Last updated | 2026-10-25  |
| Version      | 0.1.0       |
| Status       | Implemented |

## Goal

Role-specific landing after login: KPIs, alerts, charts, recent activity and quick actions from `GET /api/v1/home/*`. One sidebar **Inicio** entry; the view is resolved by `home.*.read` permission priority.

## Route

`/` → `home` (shell, `requiresAuth`).

## Role resolution

Priority (first match wins):

1. `home.admin.read` → `AdminHomeView` (SUPER_ADMIN)
2. `home.administrative.read` → `AdministrativeHomeView`
3. `home.supervisor.read` → `SupervisorHomeView`
4. `home.seller.read` → `SellerHomeView`
5. Otherwise → minimal fallback (greeting + nav quick links; no identity card, no “Mis sesiones” / “Estado del sistema” shortcuts)

## Structure (all roles)

1. Personalized header (`PageHeader`) with **Accesos rápidos** inline to the right of the greeting (`HomeQuickActions` `inline`)
2. Period filters (supervisor / admin only)
3. KPI cards (clickable when a filtered route exists)
4. Alerts / attention queue
5. Chart(s) only when the API returns non-zero series
6. Recent activity (role-specific)

Period: seller and administrative lock to the current BA month. Supervisor and admin allow past months (+ optional team) via `HomePeriodFilters` synced to the route query.

## Endpoints

| Permission                 | Endpoint                          |
| -------------------------- | --------------------------------- |
| `home.seller.read`         | `GET /api/v1/home/seller`         |
| `home.administrative.read` | `GET /api/v1/home/administrative` |
| `home.supervisor.read`     | `GET /api/v1/home/supervisor`     |
| `home.admin.read`          | `GET /api/v1/home/admin`          |

Supervisor compliance-by-seller chart also uses `GET /api/v1/supervision/sellers` (same period) to avoid duplicating a second dashboard.

TanStack Query keys include role + `userId` + period. Login/logout clear the query client (`useAuthMutations`).

## Indicators by role

### Seller

- Presentadas del mes, cumplimiento, devueltas, borradores
- Block: returned needing correction
- Chart: daily presented (+ goal mark line when usable)
- Quick: Nueva venta, Mis ventas

### Administrative

- Pendientes de revisión, en revisión, seguimientos vencidos, devueltas
- Block: attention queue + alerts
- Chart: last-7-days consolidated actions (reviews + follow-ups + observations — single series from API)
- Quick: Gestión de ventas, Seguimientos

### Supervisor

- Presentadas del equipo, cumplimiento, vendedores bajo ritmo, pendientes de gestión
- Alerts + behind-pace seller list
- Charts: daily presented vs goal; compliance by seller
- Quick: Vendedores, Administrativos, Objetivos

### Super admin

- Presentadas, cumplimiento global, pendientes, usuarios activos
- Complementary counters (overdue follow-ups, stale submitted, teams without goal, pending activation, suspended)
- Charts: period series + team performance
- Security/admin audit refs → Auditoría
- Quick: Usuarios, Equipos, Ventas, Supervisión, Auditoría

## Components

Feature-local under `src/features/home/components/` (`HomeKpiGrid`, `HomeSection`, `HomeAlertList`, `HomeSaleList`, `HomeChartCard`, `HomeQuickActions`, `HomePeriodFilters`, …). Reuses `KpiMetricCard` / `AltiumChart` / chart theme from supervision and global `PageHeader` / `EmptyState` / `ErrorState` / `StatusBadge`.

## Removed from home

- Large identity card (name / email / role) — already in the shell header
- Highlighted “Mis sesiones” and “Estado del sistema” (remain under account / system routes)

## Tests

- Unit: `src/features/home/utils/home-labels.spec.ts`
- E2E: `tests/e2e/home.spec.ts`, plus administrative/supervision home assertions

## Limitations

- Administrative “last 7 days” chart is a **single consolidated series** from the API (not three separate series).
- Charts are omitted when all series counts are zero (no fictional data).
- `AdminDashboardView` / `SupervisionDashboardView` remain in the codebase for potential deep-links but are no longer embedded in Inicio.
