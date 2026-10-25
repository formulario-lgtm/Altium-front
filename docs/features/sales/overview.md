# Sales (Mis ventas)

| Field        | Value       |
| ------------ | ----------- |
| Last updated | 2026-10-25  |
| Version      | 0.1.0       |
| Status       | Implemented |

## Goal

Capture and present health-insurance sales (prepagas) for sellers and admins with permission, using the NestJS sales API. Drafts autosave with optimistic concurrency; presentation runs server-side validation.

## Routes

| Path              | Name          | Permissions    |
| ----------------- | ------------- | -------------- |
| `/sales`          | `sales`       | `sales.read`   |
| `/sales/new`      | `sale-new`    | `sales.create` |
| `/sales/:id`      | `sale-detail` | `sales.read`   |
| `/sales/:id/edit` | `sale-edit`   | `sales.update` |

Navigation visibility follows route `meta.permissions` (SELLER typically sees only **Mis ventas** plus account/theme/logout). Authorization is enforced by the API and router guards — not by menu visibility alone.

## Screens

### Mis ventas (`SalesListView`)

- Server-side table: número, titular (CUIL masked), prepaga, plan, tipo, fecha de presentación, estado, última modificación, acciones.
- Filters: search (sale number vs holder name by shape), prepaga, plan (scoped by prepaga), tipo, estado, rango de fechas (`createdFrom` / `createdTo`).
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
5. Cobranza — TC/CBU; never send `cardNumber` / `cvv` / `cbu`. CBU capture shown as pending.
6. Documentación — categories from API; **Pendiente de integración** (no Base64 / localStorage / fake upload success).
7. Observaciones.

Autosave: debounce 800 ms + save on section change. Status: cambios pendientes / guardando / guardado / error. `version` on every PATCH; HTTP 409 `VERSION_CONFLICT` → warn and “Recuperar versión actual” (no silent overwrite).

Presentar: confirm dialog → persist → `POST .../submit` → detail (read-only). Validation errors list fields and jump to the related section. `RETURNED` sales can be edited and re-submitted.

### Detalle (`SaleDetailView`)

Read-only summary, members (`v-table`), contact, employment/tax, billing (masked card), documents pending flag, status history as a compact `v-list` (not `VTimeline`). All Vuetify tags used here must stay in `scripts/vuetify-optimize-deps.ts` so primera visita no blanquee (ver `docs/standards/ui-ux.md`).

- **Presentar** requires `sales.update` (same as API `POST .../submit`).
- **Exportar Excel** requires `sales.read` when status is `SUBMITTED`.
- **Devolver** requires `sales.return` when status is `SUBMITTED` (ADMINISTRATIVE / SUPER_ADMIN); asks for a mandatory reason.

## Feature components

- `FamilyMemberCard`, `SaleSectionNav`, `SaleSaveStatus`, `SaleDocuments`

Globals reused: `PageHeader`, `StatusBadge`, `ConfirmDialog`, `EmptyState`, `ErrorState`.

## Services / endpoints

| Function           | Endpoint                               |
| ------------------ | -------------------------------------- |
| `listSales`        | `GET /api/v1/sales`                    |
| `createSale`       | `POST /api/v1/sales`                   |
| `getSale`          | `GET /api/v1/sales/{id}`               |
| `updateSale`       | `PATCH /api/v1/sales/{id}`             |
| `submitSale`       | `POST /api/v1/sales/{id}/submit`       |
| `returnSale`       | `POST /api/v1/sales/{id}/return`       |
| `getSaleDocuments` | `GET /api/v1/sales/{id}/documents`     |
| `getSaleHistory`   | `GET /api/v1/sales/{id}/history`       |
| `exportSaleExcel`  | `GET /api/v1/sales/{id}/export` (blob) |

### Permission mapping (backend contract)

| UI action               | Permission     |
| ----------------------- | -------------- |
| List/detail             | `sales.read`   |
| Nueva venta             | `sales.create` |
| Edit/autosave/Presentar | `sales.update` |
| Devolver                | `sales.return` |
| Export Excel            | `sales.read`   |

There are **no** `sales.submit` / `sales.export` codes in the API catalog.
| `listHealthInsurers` | `GET /api/v1/health-insurers` |
| `listHealthPlans` | `GET /api/v1/health-insurers/{id}/plans` |

## Limitations (intentional)

- Object storage (DigitalOcean Spaces) not configured — documents UI is pending only.
- Payment tokenization / encrypted CBU not available — no full PAN, CVV, or CBU stored in browser or sent.
- No client-side Excel generation (uses API export).
- No sale dashboards/charts.

## Tests

- Unit: `tests/unit/feature-utils.spec.ts` (search, age/FUM, editability, form body sanitization).
- E2E: `tests/e2e/sales.spec.ts` (seller nav, list, create→edit, theme, present vs return CTAs).
