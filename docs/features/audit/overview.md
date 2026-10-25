# Audit

| Field        | Value       |
| ------------ | ----------- |
| Last updated | 2026-10-24  |
| Version      | 0.1.0       |
| Status       | Implemented |

## Goal

Read-only view of the audit trail.

## Route

`/audit` → `audit` (`meta.permissions: ['audit.read']`).

## Expected behavior

- Server-side table, newest first: date, action, entity type, outcome (`StatusBadge` SUCCESS/FAILURE), IP.
- Filters: exact `action`, exact `entityType` (debounced), `from` / `to` dates (local day bounds converted to ISO 8601).
- Clicking a row opens `AuditDetailDrawer` (right drawer): metadata fields plus `beforeData`, `afterData` and `metadata` pretty-printed.
- **Sanitized display:** the backend already strips secrets before storing; the UI additionally redacts keys matching `password|hash|token|cookie|secret|authorization|csrf|apikey` and limits depth (`utils/sanitize-json.ts`).

## Components

- Feature-local: `AuditDetailDrawer`
- Global: `PageHeader`, `StatusBadge`, `EmptyState`, `ErrorState`

## Services / endpoints

`listAuditLogs` → `GET /api/v1/audit-logs` (`limit`, `offset`, `action`, `entityType`, `from`, `to`).

## Permissions

`audit.read` (default SUPER_ADMIN and SUPERVISOR). No data scope (backend).

## Tests

Unit: `tests/unit/feature-utils.spec.ts` (redaction).

## Limitations

- `actorUserId` is shown as an id (no user lookup) and cannot be filtered from the UI yet.
- No export.
