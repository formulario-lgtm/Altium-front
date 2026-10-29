# Sales (Mis ventas)

| Field        | Value       |
| ------------ | ----------- |
| Last updated | 2026-10-26  |
| Version      | 0.1.0       |
| Status       | Implemented |

## Goal

Capture and present health-insurance sales (prepagas) for sellers and admins with permission, using the NestJS sales API. Drafts save explicitly or when changing sections, with optimistic concurrency; presentation runs server-side validation.

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
5. Cobranza — first holder-as-payer, then payment method. Card: brand, full number (13–19 digits), CVV/CVC (3–4 digits), expiration, and separate front/back JPEG/PNG images. Both holder and third-party card payers need the card data; third parties also need identity/contact. CBU/CVU/alias uses paymentMedium. Full card fields/images are encrypted by the API.
6. Documentación — required non-card API categories plus optional Otra documentación (OTHER); subida multipart (JPEG/PNG/PDF) a Spaces vía `POST .../documents`, descarga y eliminación en borrador/devuelta.
7. Observaciones.

Saving: Guardar borrador or a section change; there is no typing timer. Clean section changes skip PATCH. Status: cambios pendientes / guardando / guardado / error. `version` on every PATCH; HTTP 409 `VERSION_CONFLICT` → warn and “Recuperar versión actual” (no silent overwrite).

The capture UI marks required inputs with `*`, shows the current step, family size, per-section completion and a global requirements progress bar. **Ver pendientes** groups missing/invalid requirements and opens the corresponding section. The reference `simulador-formulario-altium.html` was used for field requirements and conditional visibility; its browser-local storage/export implementation is not used. Layout/colors/controls remain part of the Altium design system.

`getSaleReadiness` uses Zod-backed field checks on the existing typed form model. It counts only active requirements: each family member; holder-only marital status; FUM for female members older than 12; preexisting-condition detail when selected; employment/employer CUITs only for deregulated sales; tax category/current coverage only for monotax; and either holder payment metadata or alternative payer ID/email/phone. Age and observations remain optional/derived. Non-empty but invalid emails, tax IDs, dates, measurements, full card number, CVV/CVC and expiration do not count as complete. Card capture sends typed full-number/CVV fields for server encryption and derives the last four for masked summaries. Card image completion belongs to the billing step. OTHER attachments do not affect readiness; CBU/CVU/alias still uses paymentMedium.

**Presentar venta** is disabled until required fields and API document categories are complete, the latest draft save succeeded and document verification is no longer pending/failed. Missing/failed document data blocks presentation and offers retry in the documentation step. The detail-screen presentation action uses the same readiness check, preventing a bypass. Draft saving and navigation remain possible while incomplete. Confirmation rechecks readiness and stops if the final save fails; server-side validation remains authoritative.

Save requests are serialized and use detached snapshots. Responses merge only version and server-assigned member/employer identities into the existing model, preserving focus and newer keystrokes; newer edits remain unsaved until the next explicit save or section change. A successful draft response updates the detail cache directly, without refetching the same sale. Lists/home are marked stale without immediate reload, and document requirements refresh only when their sale-type/payment/member context changes. Canonical display order binds new family/employer identities to the correct local entries. Local row keys remain stable when persistent ids arrive, and member field updates keep the existing reactive object rather than replacing it.

Presentar: confirm dialog → persist → `POST .../submit` → detail (read-only). Validation errors (Problem Details `errors[].field`, e.g. `members[0].cuil`) mark the matching Vuetify fields in red with the server message, show a humanized summary above the form, and jump to the related section. Editing a field clears its error. Draft validation uses the same bindings via `useSaleForm.fieldErrors`. `RETURNED` sales can be edited and re-submitted.

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

| UI action           | Permission     |
| ------------------- | -------------- |
| List/detail         | `sales.read`   |
| Nueva venta         | `sales.create` |
| Edit/save/Presentar | `sales.update` |
| Devolver            | `sales.return` |
| Export Excel        | `sales.read`   |

There are **no** `sales.submit` / `sales.export` codes in the API catalog. Document upload/delete require `sales.update`; list/download require `sales.read`.

## Limitations (intentional)

- Full PAN/CVV and card images are encrypted by the API using a server-only key; no secrets are placed in localStorage or Excel. CBU/CVU/alias remains operational text (paymentMedium). This does not establish PCI DSS compliance; authorization/retention remains a deployment prerequisite.
- No client-side Excel generation (uses API export).
- No sale dashboards/charts.
- Document binaries are never Base64-encoded or kept in `localStorage`.

## Tests

- Unit: `tests/unit/feature-utils.spec.ts` (search, age/FUM, editability, form body sanitization).
- E2E: `tests/e2e/sales.spec.ts` (seller nav, list, create→edit, theme, present vs return CTAs).
- Unit: `sale-readiness.spec.ts` (conditional requirements, payment branches, FUM age boundary, validation and document availability); `useSaleForm.spec.ts` (explicit saves, concurrent edits, identity reconciliation, conflicts and unchanged-save deduplication).
- E2E: `tests/e2e/sale-form.spec.ts` (desktop/mobile in both themes, required markers/progress, presentation after completing and saving data, failed final persistence, document retry, and detail readiness).

- E2E: `tests/e2e/sale-detail.spec.ts` (desktop/mobile in both themes, labelled data, member disclosures, document progress/long filenames, newest history first, draft editing and document error recovery).

## Final insurer decisions

Lists, filters, recent activity and supervision status labels include APPROVED (Aprobada) and REJECTED (Rechazada). Administrative review records the decision; sellers receive an in-app notification linking to the detail. `SaleResolutionNotice` renders the final decision, reason, date and responsible user from history. All roles retain their original read scopes; final cases cannot be edited or presented again. The existing `StatusBadge` uses success/error tokens. API history is the resolution source of truth; seller observations are not overwritten.

## Shared date controls

Date filters and form dates use [DateField](../../components/date-field.md): themed calendar, full-control activation, right-aligned icon and Spanish date display. Date-only models remain YYYY-MM-DD. Follow-up date/time models remain local YYYY-MM-DDTHH:mm until the existing HTTP conversion.

`SaleAssigneeNotice` displays the current administrative responsible user near the page heading (or Sin administrativo asignado), matching the administrative review and remaining visible without scrolling to operation metadata.

Shared document presentation can receive the sale members to identify the person associated with each file; uploaded-file metadata shows date, size and status without truncating the caption.

## Billing capture update (2026-10-27)

The payer question precedes payment method in visual and keyboard order. Number and CVV fields accept digits only, hide values initially, and allow explicit visibility toggles. Draft saving can retain incomplete values, while presentation requires the complete applicable fields and CARD_FRONT/CARD_BACK. Front/back files upload independently from billing, are stored privately with application encryption, and survive reopening a draft. Documentation offers optional OTHER uploads using the same private upload/download/delete flow; old PAYMENT_PROOF files remain accessible from billing and no longer count as required card documents.

Seller and administrative read-only billing reuse SalePaymentSecrets to reveal/hide authorized full number and CVV. Supervisors receive masked metadata and cannot access card images. Do not place real card data in screenshots/tests. There is no processor/insurer authorization integration or automatic post-authorization cleanup; encryption is not PCI DSS certification. Before production collection of real cards, establish compliant authorization/retention controls, including removal of CVV from fields and images after authorization.

Regression coverage: sale-billing.spec.ts verifies ordering, numeric capture, CVV length, persisted reload, separate front/back uploads, optional OTHER, both viewport sizes/themes and administrative visibility. Backend tests cover authenticated encryption, tamper/cross-sale rejection, missing-key failure, derived last-four metadata and supervisor restrictions.

Billing inputs use stable financial names and separate autocomplete identities: bank reference disables browser autocomplete; card number and security code use the section-sale-billing cc-number/cc-csc tokens. Card masking is visual (-webkit-text-security in supported browsers), without password input types that could make credential managers treat billing as login. Visibility toggles still work. The CRM never defaults paymentMedium to the signed-in username, and previously autosaved values are preserved for user review rather than silently cleared.

## Download all documents

SaleDetailDocuments shows Descargar todo at the top in seller detail and administrative review, using a single authenticated ZIP endpoint. Available with uploaded files, disabled while loading, on metadata errors or when only pending files exist. Individual downloads remain available. The API includes only uploaded files visible to the user (including optional documents and card images only within existing restrictions), with distinct safe names for repeated filenames. Failed or cancelled streams are not treated as successful partial downloads.

The mutation shows loading and prevents duplicate requests; the global blocker remains active until the ZIP body is fully received. Download errors are shown inside the shared panel and can be retried. The ZIP is not persisted in browser storage or on the server. Regression coverage: sale-document-archive.spec.ts (seller/admin views, mobile/light and desktop/dark, a single named ZIP download with original bytes, error/retry and no-upload state).

## Responsive draft workflow (2026-10-28)

Typing updates local values, progress and validation only. Saving occurs through Guardar borrador, changing a form section, or final presentation confirmation. Changes made during a pending save stay intact and require the next explicit action; there are no follow-up timers. Clean navigation between sections does not write or reload data. Inline Guardando/Cambios sin guardar feedback replaces the global blocker for draft PATCH, document metadata checks and dependent plan options. Other foreground operations (login, route loading, submission, uploads and administrative decisions) keep the normal blocker.

The non-blocking client shares cookie credentials, CSRF, timeout, tracing and unauthorized handling with the main client. Late successful draft responses from a previous session are rejected before caching. Existing optimistic versions, backend validation, conflict recovery and verified-document requirements remain enforced. Presentation stays disabled until the latest edits are saved; final confirmation rechecks via a forced save. Upload/delete controls stay visible but disabled while draft changes or requirement verification are pending, avoiding stale member/category attachments.

Leaving through app navigation asks before discarding unsaved changes; refreshing/closing the browser uses its native beforeunload protection. Pending writes finish before route-leave decisions. Login/session-expiry navigation is never blocked by the unsaved-changes dialog.

Coverage: sale-draft-saving.spec.ts exercises no typing writes, explicit/section saves, focus stability under delayed responses, request counts, queued versions, upload gating, safe leave/cancel, conflict recovery and expired sessions. Unit coverage verifies detached snapshots, new member identities, no delayed writes, stale-session rejection and retained CSRF/session controls.

### Validation before saving and section navigation

Provided values are validated locally only on Guardar borrador, Anterior/Continuar, section navigation (desktop/mobile and progress links), and final presentation save. There is no blur validation or per-keystroke request. Incomplete drafts may keep missing required values; invalid supplied values (CUIL/CUIT check digit, emails, dates, measurements, payment data, numeric precision and API text limits) block saving and navigation. These checks reuse presentation rules. Missing documents are enforced on presentation, not draft saves.

Section navigation waits for successful persistence and keeps the current section on failure. All field errors appear in a humanized summary and the first affected section/field is opened and focused, including server-only validation errors from any section. Correcting a field clears its displayed error; the next action revalidates it. Slow saves keep inline progress without the global overlay. If newer edits arrive during a save, the section stays open until those edits are saved too.

### Delete an own draft

The sales list and detail expose a shared Borrar action only for SELLER with sales.update, the owning seller ID, DRAFT status and no submittedAt. A confirmation dialog identifies the sale number; cancel sends no request. Failures remain in the dialog for review/retry. Successful deletion evicts detail/document/history caches, refreshes sales lists and marks role dashboards/analytics stale; detail returns to Mis ventas.

DELETE /api/v1/sales/:id enforces the same restrictions server-side, including firstSubmittedAt and an atomic version guard. RETURNED and all later workflow statuses cannot be deleted, and SUPER_ADMIN has no exception. This uses the existing soft-delete field, retains audit and private attachment storage, and does not reuse sale numbers. Presentation/edition races return 409 and do not delete the sale.
