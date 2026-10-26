# Sales (Mis ventas)

| Field        | Value       |
| ------------ | ----------- |
| Last updated | 2026-10-26  |
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

The capture UI marks required inputs with `*`, shows the current step, family size, per-section completion and a global requirements progress bar. **Ver pendientes** groups missing/invalid requirements and opens the corresponding section. The reference `simulador-formulario-altium.html` was used for field requirements and conditional visibility; its browser-local storage/export implementation is not used. Layout/colors/controls remain part of the Altium design system.

`getSaleReadiness` uses Zod-backed field checks on the existing typed form model. It counts only active requirements: each family member; holder-only marital status; FUM for female members older than 12; preexisting-condition detail when selected; employment/employer CUITs only for deregulated sales; tax category/current coverage only for monotax; and either holder payment metadata or alternative payer ID/email/phone. Age and observations remain optional/derived. Non-empty but invalid emails, tax IDs, dates, measurements, card last-four/expiration do not count as complete. Card capture follows the API (brand, last four, expiration); CBU/CVU/alias uses `paymentMedium`, without adding unsupported full-card/dedicated CBU fields.

**Presentar venta** is disabled until required fields and API document categories are complete, the latest draft save succeeded and document verification is no longer pending/failed. Missing/failed document data blocks presentation and offers retry in the documentation step. The detail-screen presentation action uses the same readiness check, preventing a bypass. Draft saving and navigation remain possible while incomplete. Confirmation rechecks readiness and stops if the final save fails; server-side validation remains authoritative.

Pending debounce timers are cleared on manual persistence to avoid a duplicate save after presentation. Updates from a PATCH's query-cache refresh cannot overwrite edits made while saving; the current local model keeps those edits and adopts the new version before the next save.

Presentar: confirm dialog → persist → `POST .../submit` → detail (read-only). Validation errors (Problem Details `errors[].field`, e.g. `members[0].cuil`) mark the matching Vuetify fields in red with the server message, show a humanized summary above the form, and jump to the related section. Editing a field clears its error. Autosave validation uses the same bindings via `useSaleForm.fieldErrors`. `RETURNED` sales can be edited and re-submitted.

### Detalle (`SaleDetailView`)

Read-only detail starts with the holder identity and a compact coverage summary. `SaleDetailData` groups labelled contact, employment/tax, billing (masked card and conditional payer data), and operation metadata using `SaleDetailFields` (`dl`/`dt`/`dd`). Missing values say “Sin completar”. Member cards expose personal/health fields through keyboard-accessible disclosure elements. `SaleDetailDocuments` shows completed/required progress, labelled requirements, wrapped filenames and accessible download actions; loading, retry and download errors remain visible. Status history uses a compact `v-list`, newest first, with loading/error/empty states. Editable incomplete sales explain why presentation is disabled and prioritize Editar. Layout stacks on mobile and uses the shared light/dark design tokens. All Vuetify tags used here must stay in `scripts/vuetify-optimize-deps.ts` so primera visita no blanquee (ver `docs/standards/ui-ux.md`).

- **Presentar** requires `sales.update` (same as API `POST .../submit`).
- **Exportar Excel** requires `sales.read` for non-draft sales, including final outcomes. Final exports include resolution date and reason.
- **Devolver** requires `sales.return` when status is `SUBMITTED` or `IN_REVIEW`; asks for a mandatory reason (prefer administrative review screen for admins).
- **RETURNED**: banner + correction requests panel (API hides internal notes from sellers); edit and re-present via `sales.update`.
- Status `IN_REVIEW` is labelled in lists/badges; administrative users should use `/administrative/sales/:id` for full review actions.

## Feature components

- `FamilyMemberCard`, `SaleSectionNav`, `SaleSaveStatus`, `SaleDocuments`, `SaleFormProgress`, `SaleContactFields`, `SaleEmploymentFields`, `SaleTaxFields`, `SaleBillingFields`. Field groups reuse the typed form model and existing server-error bindings; no HTTP in presentational components.

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
- Unit: `sale-readiness.spec.ts` (conditional requirements, payment branches, FUM age boundary, validation and document availability); `useSaleForm.spec.ts` (in-flight edits and debounce cancellation).
- E2E: `tests/e2e/sale-form.spec.ts` (desktop/mobile in both themes, required markers/progress, presentation after completing and saving data, failed final persistence, document retry, and detail readiness).

- E2E: `tests/e2e/sale-detail.spec.ts` (desktop/mobile in both themes, labelled data, member disclosures, document progress/long filenames, newest history first, draft editing and document error recovery).

## Final insurer decisions

Lists, filters, recent activity and supervision status labels include APPROVED (Aprobada) and REJECTED (Rechazada). Administrative review records the decision; sellers receive an in-app notification linking to the detail. `SaleResolutionNotice` renders the final decision, reason, date and responsible user from history. All roles retain their original read scopes; final cases cannot be edited or presented again. The existing `StatusBadge` uses success/error tokens. API history is the resolution source of truth; seller observations are not overwritten.

## Shared date controls

Date filters and form dates use [DateField](../../components/date-field.md): themed calendar, full-control activation, right-aligned icon and Spanish date display. Date-only models remain YYYY-MM-DD. Follow-up date/time models remain local YYYY-MM-DDTHH:mm until the existing HTTP conversion.

`SaleAssigneeNotice` displays the current administrative responsible user near the page heading (or Sin administrativo asignado), matching the administrative review and remaining visible without scrolling to operation metadata.

Shared document presentation can receive the sale members to identify the person associated with each file; uploaded-file metadata shows date, size and status without truncating the caption.
