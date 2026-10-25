# Administrative sales UI

| Field        | Value       |
| ------------ | ----------- |
| Last updated | 2026-10-25  |
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
- `RETURNED` → consulta; wait for seller resubmit.

Return is never optimistic: waits for API success before closing the dialog.

### Seguimientos

Work queue of sales (backend status filter) plus dashboard pending count. Per-sale follow-ups via `GET/POST /sales/:id/follow-ups`. No global follow-up list endpoint in the contract.

## Components

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

Email/push, approval/final states, assignment admin UI (`administrative.assignments.manage`), calendar widgets, inventing list filters absent from OpenAPI.
