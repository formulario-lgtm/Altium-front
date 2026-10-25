# Sales (Mis ventas)

| Field        | Value       |
| ------------ | ----------- |
| Last updated | 2026-10-25  |
| Version      | 0.1.0       |
| Status       | Implemented |

## Goal

Capture and present health-insurance sales (prepagas) for sellers and admins with permission, using the NestJS sales API. Drafts autosave with optimistic concurrency; presentation runs server-side validation.

## Routes

| Path              | Name          | Permissions                   |
| ----------------- | ------------- | ----------------------------- |
| `/sales`          | `sales`       | `sales.create` (nav; sellers) |
| `/sales/new`      | `sale-new`    | `sales.create`                |
| `/sales/:id`      | `sale-detail` | `sales.read`                  |
| `/sales/:id/edit` | `sale-edit`   | `sales.update`                |

Navigation visibility follows route `meta.permissions` (SELLER typically sees only **Mis ventas** plus account/theme/logout). Authorization is enforced by the API and router guards — not by menu visibility alone.

## Screens

### Mis ventas (`SalesListView`)

- Server-side table: número (entero, p. ej. `1`), titular (CUIL masked), prepaga, plan, tipo, fecha de creación (`dd/mm/aaaa hh:mm`), estado, acciones. Sin columna de última modificación.
- Filters: search (sale number vs holder name by shape), prepaga, plan (scoped by prepaga), tipo, estado, rango por fecha de creación (`createdFrom` / `createdTo`); orden por defecto `createdAt` desc.
- Display helpers: `formatSaleNumber` / `formatDateTime` (`src/utils/format.ts`) — mismos criterios en gestión administrativa y listados de home.
- Actions: Ver, Editar / Presentar when status is `DRAFT` or `RETURNED` and the user has the matching permission.
- Empty / error / loading via shared components. No dashboards or fake KPIs.

### Nueva venta (`SaleCreateView`)

- `POST /api/v1/sales` (optional default insurer) → `router.replace` to edit form. No local draft storage.

### Formulario (`SaleFormView`)

Section nav (sidebar desktop / select mobile):

1. Datos de la venta — prepaga → tipo → plan (plans from API filtered by insurer).
2. Integrantes — titular obligatorio; cónyuge / hijos dinámicos; edad calculada (not persisted); FUM when sex=F and age>12; preexistencias detail when Sí.
3. Contacto y domicilio.
4. Situación laboral (`DEREGULATED`) or impositiva (`MONOTAX`); hidden for `VOLUNTARY`. Incompatible payloads are cleared before PATCH.
5. Cobranza — TC (marca + últimos 4 + vencimiento) o CBU/CVU/ALIAS textual en `paymentMedium`. Never send `cardNumber` / `cvv` / dedicated `cbu` field.
6. Documentación — categorías requeridas desde la API; subida multipart (JPEG/PNG/PDF) a Spaces vía `POST .../documents`, descarga y eliminación en borrador/devuelta.
7. Observaciones.

Autosave: debounce 800 ms + save on section change. Status: cambios pendientes / guardando / guardado / error. `version` on every PATCH; HTTP 409 `VERSION_CONFLICT` → warn and “Recuperar versión actual” (no silent overwrite).

Presentar: confirm dialog → persist → `POST .../submit` → detail (read-only). Validation errors (Problem Details `errors[].field`, e.g. `members[0].cuil`) mark the matching Vuetify fields in red with the server message, show a humanized summary above the form, and jump to the related section. Editing a field clears its error. Autosave validation uses the same bindings via `useSaleForm.fieldErrors`. `RETURNED` sales can be edited and re-submitted.

### Detalle (`SaleDetailView`)

Read-only summary, members (`v-table`), contact, employment/tax, billing (masked card), document categories + download of uploaded files, status history as a compact `v-list` (not `VTimeline`). All Vuetify tags used here must stay in `scripts/vuetify-optimize-deps.ts` so primera visita no blanquee (ver `docs/standards/ui-ux.md`).

- **Presentar** requires `sales.update` (same as API `POST .../submit`).
- **Exportar Excel** requires `sales.read` when status is `SUBMITTED`.
- **Devolver** requires `sales.return` when status is `SUBMITTED` or `IN_REVIEW`; asks for a mandatory reason (prefer administrative review screen for admins).
- **RETURNED**: banner + correction requests panel (API hides internal notes from sellers); edit and re-present via `sales.update`.
- Status `IN_REVIEW` is labelled in lists/badges; administrative users should use `/administrative/sales/:id` for full review actions.

## Feature components

- `FamilyMemberCard`, `SaleSectionNav`, `SaleSaveStatus`, `SaleDocuments`

Globals reused: `PageHeader`, `StatusBadge`, `ConfirmDialog`, `EmptyState`, `ErrorState`.

## Services / endpoints

| Function               | Endpoint                                                 |
| ---------------------- | -------------------------------------------------------- |
| `listSales`            | `GET /api/v1/sales`                                      |
| `createSale`           | `POST /api/v1/sales`                                     |
| `getSale`              | `GET /api/v1/sales/{id}`                                 |
| `updateSale`           | `PATCH /api/v1/sales/{id}`                               |
| `submitSale`           | `POST /api/v1/sales/{id}/submit`                         |
| `returnSale`           | `POST /api/v1/sales/{id}/return`                         |
| `getSaleDocuments`     | `GET /api/v1/sales/{id}/documents`                       |
| `uploadSaleDocument`   | `POST /api/v1/sales/{id}/documents` (multipart)          |
| `downloadSaleDocument` | `GET /api/v1/sales/{id}/documents/{documentId}/download` |
| `deleteSaleDocument`   | `DELETE /api/v1/sales/{id}/documents/{documentId}`       |
| `getSaleHistory`       | `GET /api/v1/sales/{id}/history`                         |
| `exportSaleExcel`      | `GET /api/v1/sales/{id}/export` (blob)                   |
| `listHealthInsurers`   | `GET /api/v1/health-insurers`                            |
| `listHealthPlans`      | `GET /api/v1/health-insurers/{id}/plans`                 |

### Permission mapping (backend contract)

| UI action               | Permission     |
| ----------------------- | -------------- |
| List/detail             | `sales.read`   |
| Nueva venta             | `sales.create` |
| Edit/autosave/Presentar | `sales.update` |
| Devolver                | `sales.return` |
| Export Excel            | `sales.read`   |

There are **no** `sales.submit` / `sales.export` codes in the API catalog. Document upload/delete require `sales.update`; list/download require `sales.read`.

## Limitations (intentional)

- No full PAN/CVV; CBU/CVU/ALIAS is stored as operational text (`paymentMedium`). Encrypted `encrypted_cbu` remains unused.
- No client-side Excel generation (uses API export).
- No sale dashboards/charts.
- Document binaries are never Base64-encoded or kept in `localStorage`.

## Tests

- Unit: `tests/unit/feature-utils.spec.ts` (search, age/FUM, editability, form body sanitization).
- E2E: `tests/e2e/sales.spec.ts` (seller nav, list, create→edit, theme, present vs return CTAs).
