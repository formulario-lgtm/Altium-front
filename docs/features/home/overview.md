# Home

| Field        | Value       |
| ------------ | ----------- |
| Last updated | 2026-10-27  |
| Version      | 0.1.0       |
| Status       | Implemented |

## Goal

Role-specific landing after login: KPIs, alerts, charts, recent activity and quick actions from `GET /api/v1/home/*`. One sidebar **Inicio** entry; the view prefers the account role when its `home.*.read` permission is available, then falls back to permission priority.

## Route

`/` → `home` (shell, `requiresAuth`).

## Role resolution

Prefer SUPER_ADMIN / SUPERVISOR / ADMINISTRATIVE / SELLER role first when allowed. Permission-only fallback (first match wins):

1. `home.admin.read` → `AdminHomeView` (SUPER_ADMIN)
2. `home.supervisor.read` → `SupervisorHomeView`
3. `home.administrative.read` → `AdministrativeHomeView`
4. `home.seller.read` → `SellerHomeView`
5. Otherwise → minimal fallback (greeting + nav quick links; no identity card, no “Mis sesiones” / “Estado del sistema” shortcuts)

## Structure (all roles)

1. Personalized header (`PageHeader`) with a primary action and compact secondary buttons. `HomeQuickActions` `inline` uses standard Vuetify buttons; administration keeps secondary organization/audit shortcuts in its security panel.
2. Period filters (supervisor / admin only)
3. KPI cards (clickable when a filtered route exists)
4. Alerts / attention queue
5. Chart(s) only when the API returns non-zero series
6. Recent activity (role-specific): seller sales and admin security events show at most the latest five records, sorted by update/event timestamp descending without mutating the API response. Full lists remain available via Ver todas / Ver auditoría. Administrative priorities show the first five sales in API priority order, with Ver cola linking to the complete queue. Upcoming sales follow-ups keep their existing behavior.

Period: seller and administrative lock to the current BA month. Supervisor allows past months and an optional team; admin allows past months for its global overview. `HomePeriodFilters` syncs to the route query, with month/year side by side on phones. Admin does not expose a team selector because the endpoint computes global metrics regardless of `teamId`.

## Endpoints

| Permission                 | Endpoint                          |
| -------------------------- | --------------------------------- |
| `home.seller.read`         | `GET /api/v1/home/seller`         |
| `home.administrative.read` | `GET /api/v1/home/administrative` |
| `home.supervisor.read`     | `GET /api/v1/home/supervisor`     |
| `home.admin.read`          | `GET /api/v1/home/admin`          |

Supervisor home uses one complete monthly summary response, with no first-page seller comparison query.

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
- Monthly goals/progress are temporarily hidden; the sales card shows daily presentations only.
- Daily bar chart grows into the remaining card space (minimum 180px), avoiding a blank area below the graph when the adjacent activity list is taller. `AltiumChart` observes container resizing to keep the canvas synchronized. Uses API dates/counts only, integer ticks and a zero baseline. No goal reference or progress is rendered while objectives are paused.
- Quick: Nueva venta, Mis ventas; draft continuation link only when drafts exist and `sales.read` is granted. No new endpoints or dependencies.

### Administrative

- Pendientes de revisión, en revisión, seguimientos vencidos, devueltas
- **Gestión de ventas** is the primary header action; **Seguimientos** is secondary. A compact summary shows today's presented sales/reviews and this month's actions from the API.
- First row: **Prioridades de hoy** and **Próximos seguimientos**, with equal card heights on desktop and natural heights on phones. Review rows identify the sale and show **Revisar**; follow-ups show description, scheduled date (or **Sin fecha programada**) and link to the review's follow-up section.
- The consolidated weekly action chart and additional operational alerts sit below the work queues. Review/return alerts already represented in the queue and KPI counts are not repeated. A compact success notice replaces an empty alert panel when there are no API alerts. The chart uses dates, integer counts and one bar per API point; no repeated long legend or artificial monthly target.
- No new endpoints or dependencies; existing review/follow-up permissions still control access.

### Supervisor

- Presentations, reviewed sales, approvals and rejections for the selected month.
- Header shortcuts: **Equipos**, **Vendedores**, **Administrativos**. Analytics detail links preserve year/month/team.
- Two monthly panels: seller presentation shares/current cohort statuses and administrative review shares/monthly movements. All people and totals are shown; no goal charts or pace tracking.
- Current assigned/unassigned work and overdue sales follow-ups are labeled separately from monthly activity.
- The home request provides all person metrics; no additional paginated seller comparison request is needed.

### Super admin

- Presentadas, pendientes, usuarios activos (goal-derived compliance is paused)
- Only **Gestión de ventas** (primary) and **Usuarios** appear in the header. **Equipos**, **Supervisión** and **Auditoría** remain under **Accesos rápidos** in the security panel.
- **Pendientes y riesgos** groups overdue follow-ups, delayed submissions, pending activations and suspended accounts into labeled rows with counts and management destinations. Zero counts stay neutral; suspended accounts are informational. Alerts for these same counters are not repeated.
- **Seguridad y administración** pairs with the operations panel: Spanish action/entity labels, formatted timestamps and `StatusBadge` outcomes, with permission-aware audit links. The empty state stays useful alongside the shortcuts.
- Second row: **Avance comercial** (the API's six-month sales history, labeled by month/year) and **Rendimiento por equipos**, stretched to equal heights, with charts filling the available space. Team bars have bounded width and use the shared palette. Goal percentage series/axes are hidden while paused.
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

## Cold-load behavior

`HomeView` imports only the selected role view through `useRoleHomeView`. Other roles and their module graphs are not loaded at login. A global task covers the import and first render until API tracking takes over. A failed import releases the blocker and shows an error; retry reloads the page to avoid cached failed module requests. Watch cleanup prevents late imports from rendering after role changes or leaving the page.

## Supervisor monthly workspace (2026-10-27)

The supervisor home defaults to the current Buenos Aires month and retains period/team filters. A supervisor with administrative home permission still sees the supervisor workspace. Header shortcuts are Equipos, Vendedores and Administrativos, gated by their route permissions.

Two equally sized panels stack on small screens: sellers on the left and administrative work on the right. `SupervisorSellersPanel` shows a donut of monthly presentations by seller and a complete per-person status table; `SupervisorAdministrativesPanel` shows a donut of reviewed sales by actual actor plus approvals, rejections, return movements and current assigned stock. `SupervisorShareChart` uses the shared chart renderer and theme palette; zero activity uses an explicit empty state rather than an empty pie. No row/person cap is used in this analytics summary.

The contract deliberately separates monthly first-presentation cohorts/current statuses from administrative movements that occurred during the month (including older sales). Reviewed sales count once per sale, attributed to the first reviewer of that month. Repeated return movements count again. Workload/unassigned/overdue sales follow-ups are current stock and are labeled separately. Table totals provide a readable alternative to the charts; detail links keep year/month/team filters.

## Temporary monthly goals pause

`src/config/features.ts` disables all monthly goals routes/navigation, home goal KPIs/progress/alerts, supervision goal columns and goal-based chart series. Seller daily presentations and operational sales follow-ups remain available. Backend guards block goal creation, updates, listing and history even when permissions remain granted. Existing data/history are preserved. Reactivation requires deliberately enabling the matching frontend/API switches and revalidating the feature.

Tests: `supervisor-monthly.spec.ts`, responsive role-home coverage, `supervisor-charts.spec.ts`, home-label role-priority regression; API scope/counting/goal guard tests live in the backend.

On phones, `SupervisorMobileMetrics` presents every person and their status counts in a wrapped definition list; desktop uses compact tables. No metric requires horizontal scrolling on phones. Shared chart palettes remove duplicate and surface-colored series so slices remain distinct in both themes.
