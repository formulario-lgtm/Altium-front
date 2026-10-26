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

1. Personalized header (`PageHeader`) with a primary action and compact secondary buttons. `HomeQuickActions` `inline` uses standard Vuetify buttons; administration keeps secondary organization/audit shortcuts in its security panel.
2. Period filters (supervisor / admin only)
3. KPI cards (clickable when a filtered route exists)
4. Alerts / attention queue
5. Chart(s) only when the API returns non-zero series
6. Recent activity (role-specific)

Period: seller and administrative lock to the current BA month. Supervisor allows past months and an optional team; admin allows past months for its global overview. `HomePeriodFilters` syncs to the route query, with month/year side by side on phones. Admin does not expose a team selector because the endpoint computes global metrics regardless of `teamId`.

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
- Compact work queue: returned sales first, plus an explicit link to the filtered draft list. When no corrections are pending, a compact confirmation replaces the former two large empty panels.
- All role-home KPI cards use two columns on phones, with decorative icons hidden there to leave room for values and labels. `HomeKpiGrid` / `KpiMetricCard` expose an opt-in `compactMobile` layout; other feature screens retain their layout.
- Correction alerts already represented by the returned-sale queue are omitted; other operational alerts remain visible, including correction alerts when the queue is empty. `NO_GOAL` stays out of the operational queue.
- Recent activity and monthly progress sit side by side on desktop and stack on smaller screens. Activity identifies each item as **Venta**, labels its update timestamp, and shows **Continuar**, **Corregir**, or **Ver detalle** with its status.
- Recent activity includes the holder's first and last name in the sale title (**Venta 5 - Pedro Pereira**) from the seller-home response; incomplete drafts show **Titular sin completar**, with partial names preserved. Long titles wrap on narrow screens. Both cards stretch to the same height when side by side, while stacked mobile cards retain their natural height.
- Native list links support keyboard navigation; draft/returned items go directly to editing only with `sales.update`, otherwise to detail. Other roles retain their existing list behavior.
- Monthly progress: percentage, target, remaining sales, and a goal-reached message. Progress bar clamps to 0–100 while the percentage text can exceed 100. Missing/zero goals show explanatory copy without fictional progress.
- Daily bar chart grows into the remaining card space (minimum 180px), avoiding a blank area below the graph when the adjacent activity list is taller. `AltiumChart` observes container resizing to keep the canvas synchronized. Uses API dates/counts only, integer ticks and a zero baseline. The monthly target is shown as progress rather than a daily chart reference line.
- Quick: Nueva venta, Mis ventas; draft continuation link only when drafts exist and `sales.read` is granted. No new endpoints or dependencies.

### Administrative

- Pendientes de revisión, en revisión, seguimientos vencidos, devueltas
- **Gestión de ventas** is the primary header action; **Seguimientos** is secondary. A compact summary shows today's presented sales/reviews and this month's actions from the API.
- First row: **Prioridades de hoy** and **Próximos seguimientos**, with equal card heights on desktop and natural heights on phones. Review rows identify the sale and show **Revisar**; follow-ups show description, scheduled date (or **Sin fecha programada**) and link to the review's follow-up section.
- The consolidated weekly action chart and additional operational alerts sit below the work queues. Review/return alerts already represented in the queue and KPI counts are not repeated. A compact success notice replaces an empty alert panel when there are no API alerts. The chart uses dates, integer counts and one bar per API point; no repeated long legend or artificial monthly target.
- No new endpoints or dependencies; existing review/follow-up permissions still control access.

### Supervisor

- Presentadas del equipo, cumplimiento, vendedores bajo ritmo, pendientes de gestión
- Primary **Vendedores**, secondary **Administrativos** / **Objetivos** buttons. Selected year/month/team are retained when opening analytics, goals or a seller.
- First row: **Vendedores bajo ritmo** (name, avatar, presented sales, compliance and direct detail link) beside **Avance del equipo**. The monthly objective is a progress bar; the daily sales chart fills the remaining card space. Missing/zero goals are explained without fake 0%.
- Expected pace is explicit. A `BEHIND_PACE` alert already represented by the seller list is not repeated; other operational alerts remain visible. Goal absence is explained in the progress panel.
- Seller comparison sorts available compliance ascending, labels full names and percentages and supports percentages above 100. Missing goals/null compliance are excluded rather than rendered as 0. Comparison loading/error/retry is independent of the home data.
- A KPI/alert without permission to open its destination remains informational (for example, a supervisor cannot open administrative sales without `sales.review`).

### Super admin

- Presentadas, cumplimiento global, pendientes, usuarios activos
- Only **Gestión de ventas** (primary) and **Usuarios** appear in the header. **Equipos**, **Supervisión** and **Auditoría** remain under **Accesos rápidos** in the security panel.
- **Pendientes y riesgos** groups overdue follow-ups, delayed submissions, missing team goals, pending activations and suspended accounts into labeled rows with counts and management destinations. Zero counts stay neutral; suspended accounts are informational. Alerts for these same counters are not repeated.
- **Seguridad y administración** pairs with the operations panel: Spanish action/entity labels, formatted timestamps and `StatusBadge` outcomes, with permission-aware audit links. The empty state stays useful alongside the shortcuts.
- Second row: **Avance comercial** (selected month's goal progress plus the API's six-month sales history, labeled by month/year) and **Rendimiento por equipos**, stretched to equal heights, with charts filling the available space. Team bars have bounded width; percentage markers and a separate legend remain readable even for one team. Percentage axes include exceeded goals; absent compliance stays null.
- User links open the user-management list; they do not claim to apply a status filter that the destination does not support.

## Components

Feature-local under `src/features/home/components/`: shared `HomePanel` (semantic card with title, subtitle and actions inside its header), `HomeChartCard` (flexible chart space with minimum height, loading and summary slot), `HomeGoalProgress`, `HomeKpiGrid`, `HomeAlertList`, `HomeSaleList`, `HomeQuickActions`, `HomePeriodFilters`, `HomeSellerPaceList`, `AdminOperationsList`, `HomeSecurityList` and seller components. Reuses `KpiMetricCard` / `AltiumChart` / chart theme from supervision and global `PageHeader` / `EmptyState` / `ErrorState` / `StatusBadge` / `UserAvatar`. All layouts use Vuetify defaults and utility classes, without feature-specific surface/button skins or hardcoded palette colors. Native links support keyboard navigation and normal browser link actions. `accessibleHomeRoute` checks the destination route's permission metadata; `withHomePeriod` retains drill-down context.

Every repeated `VListItem` supplies a unique `value` from its row ID/key, separate from the URL. Multiple account rows may link to `/users`, and multiple security events may link to `/audit`, without duplicate Vuetify node IDs. Chart grids use ECharts 6 `outerBoundsMode` / `outerBoundsContain`, replacing deprecated `containLabel` while retaining axis-label containment.

## Removed from home

- Large identity card (name / email / role) — already in the shell header
- Highlighted “Mis sesiones” and “Estado del sistema” (remain under account / system routes)

## Tests

- Unit: `src/features/home/utils/home-labels.spec.ts`, `home-charts.spec.ts`, `home-navigation.spec.ts`
- E2E: `tests/e2e/home.spec.ts` covers seller corrections/draft navigation, missing and zero goals, exceeded goals, read-only permissions, empty activity and desktop/mobile in light/dark themes; plus administrative/supervision home assertions.
- E2E: `tests/e2e/home-roles.spec.ts` covers the three operational roles on desktop/mobile in light/dark, empty states, paired card heights, review/follow-up links, period/team preservation, independent comparison errors/retry, permission-aware drill-downs and translated security events.

## Limitations

- Administrative “last 7 days” chart is a **single consolidated series** from the API (not three separate series).
- Chart canvases are omitted when no usable series exists (no fictional data); their panels explain the empty state.
- `AdminDashboardView` / `SupervisionDashboardView` remain in the codebase for potential deep-links but are no longer embedded in Inicio.
