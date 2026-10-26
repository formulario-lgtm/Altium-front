# Administrative sales UI

| Field        | Value       |
| ------------ | ----------- |
| Last updated | 2026-10-26  |
| Version      | 0.1.0       |
| Status       | Implemented |

## Goal

Operational UI for the ADMINISTRATIVE role: scoped dashboard, sales review queue, follow-ups entry points, typed observations, and in-app notifications. Sellers keep **Mis ventas**; administrators do not edit commercial data arbitrarily.

## Routes

| Path                         | Name                | Permissions                            |
| ---------------------------- | ------------------- | -------------------------------------- |
| `/` (when permitted)         | `home`              | `home.administrative.read` (role home) |
| `/administrative/sales`      | `admin-sales`       | `sales.review`                         |
| `/administrative/sales/:id`  | `admin-sale-review` | `sales.review`                         |
| `/administrative/follow-ups` | `admin-follow-ups`  | `sales.follow_up`                      |

Navigation: **Inicio**, **Gestión de ventas**, **Seguimientos**. **Mis ventas** requires `sales.create` so pure ADMINISTRATIVE users do not see the seller workspace. Users / roles / audit remain gated by their own permissions.

## Screens

### Inicio (`AdministrativeHomeView`)

Operational home from `GET /api/v1/home/administrative` (`home.administrative.read`): KPIs, prioridades de hoy, alertas, actividad 7 días y accesos a Gestión / Seguimientos. The legacy `AdminDashboardView` (`GET /administrative/dashboard`) remains available as a component but is no longer embedded in Inicio.

### Gestión de ventas

Server-side table using `GET /sales` filters available in the contract: search, status, tipo, prepaga, plan, fechas. Columns include vendedor (from list DTO). Assignee and “open observations” filters are **not** in the OpenAPI list query yet — documented as backend follow-up; UI does not fake client-only filters.

### Revisión (`AdminSaleReviewView`)

Sectioned read-only review (not the seller form): resumen, datos, integrantes, contacto, laboral/impositivo, cobranza (masked card / CBU pending), documentos, observaciones, seguimientos, historial.

Actions by status/permission:

- `SUBMITTED` → iniciar revisión (`sales.review`), solicitar corrección (`sales.return` + motivo).
- `IN_REVIEW` → corrección, nota interna, seguimiento, tomar responsabilidad (`PATCH …/assignee`).
- `SUBMITTED` / `IN_REVIEW` → Aprobar / Rechazar (`sales.review`). `SaleResolutionActions` requires confirmation and a trimmed 3–2000 character rejection reason (optional approval note). The dialog captures the sale version at opening; stale decisions remain unconfirmed and offer Revisar versión actual.
- `RETURNED` → consulta; wait for seller resubmit.
- `APPROVED` / `REJECTED` → final, read-only. `SaleResolutionNotice` shows reason, actor and date from scoped history and offers retry on load errors. No edit, return, resubmit, notes, correction resolution, follow-up or assignment controls. Existing documents/history/export remain accessible. Backend closes pending follow-ups and notifies the seller.

Return is never optimistic: waits for API success before closing the dialog.

### Seguimientos

Work queue of sales (backend status filter) plus dashboard pending count. Per-sale follow-ups via `GET/POST /sales/:id/follow-ups`. No global follow-up list endpoint in the contract.

## Components

- `AdminSaleData` renders complete business data for details, family members, employment/tax and billing using the typed Sale API contract and shared labelled fields. Personal/medical data is expanded for every member; no summary-only table or clinical-data omission notice. FUM and preexisting-condition descriptions appear when applicable or saved. Payment expiration, alternative payer and provider reference are included; card data remains limited to the brand/last-four metadata stored by the API. Employment/tax sections remain visible for the corresponding customer type even when data is missing.
- `AdminReviewSectionNav`, `SaleObservationsPanel`, `SaleFollowUpsPanel`
- Global `NotificationsMenu` in `AppHeader`

## Endpoints

| UI action               | API                                                                   |
| ----------------------- | --------------------------------------------------------------------- |
| Dashboard               | `GET /api/v1/administrative/dashboard`                                |
| Queue / follow-ups list | `GET /api/v1/sales`                                                   |
| Start review            | `POST /api/v1/sales/{id}/start-review`                                |
| Return                  | `POST /api/v1/sales/{id}/return`                                      |
| Observations            | `GET/POST /api/v1/sales/{id}/observations`, `PATCH …/resolve`         |
| Follow-ups              | `GET/POST /api/v1/sales/{id}/follow-ups`                              |
| Assignee                | `PATCH /api/v1/sales/{id}/assignee`                                   |
| Notifications           | `GET /notifications`, `unread-count`, `PATCH …/read`, `POST read-all` |

## Seller adjustments

- Notifications bell when `notifications.read`.
- Returned sales highlighted in Mis ventas; detail shows correction requests (API hides internal notes).
- Edit + re-present remains `DRAFT`/`RETURNED` + `sales.update`.

## Out of scope

Email/push, reopening final cases, assignment admin UI (`administrative.assignments.manage`), calendar widgets, inventing list filters absent from OpenAPI.

## Insurer resolution integration

`POST /api/v1/sales/{id}/resolve` sends the generated `ResolveSaleBody` (APPROVED/REJECTED, version and conditional reason). Success refreshes sale detail/history, lists, follow-ups, administrative dashboard, home, supervision, audit and notifications. Server permission and data scope remain authoritative. Monthly actions include resolutions; presentation metrics retain their original meaning. E2E: `sale-resolution.spec.ts` covers both decisions, required rejection reason, CSRF, stale version recovery and seller/supervisor/admin visibility.

## Shared date controls

Date filters and form dates use [DateField](../../components/date-field.md): themed calendar, full-control activation, right-aligned icon and Spanish date display. Date-only models remain YYYY-MM-DD. Follow-up date/time models remain local YYYY-MM-DDTHH:mm until the existing HTTP conversion.

## Contact data and responsibility

The review Contacto section reuses `SaleDetailFields` to label phone, email, address, postal code and province, with Sin completar for absent values and a responsive grid. Tomar responsabilidad assigns the current user as the administrative assignee; it does not change sale status. Iniciar revisión automatically assigns the actor only when no assignee was set.

The administrative assignee is displayed above every review section through `SaleAssigneeNotice`, and also in the general sale detail visible to sellers and other scoped roles. Tomar responsabilidad is offered only for unassigned IN_REVIEW cases; it is hidden for every existing assignee, including the current user. The handler also checks that the local sale is still unassigned. Success updates the assignee through the existing server mutation and query invalidation. No reassignment control is exposed here.

Document review reuses `SaleDetailDocuments`: full filenames, required categories, associated family member, upload timestamp, size/status, download and explicit loading/error recovery. Seller observations keep line breaks. E2E coverage in `administrative-review-data.spec.ts` includes full family/medical fields, alternative payer, card expiration, multiple employers and incomplete applicable sections.
