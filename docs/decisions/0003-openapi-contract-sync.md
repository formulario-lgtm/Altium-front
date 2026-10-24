# 0003 — Explicit OpenAPI contract sync between repos

## Status

Accepted — 2026-10-24

## Context

Backend and frontend are separate Git repositories. Binding the frontend to a sibling filesystem path (`../Altium-back/...`) would break CI and remote clones.

## Decision

1. Backend publishes `openapi/openapi.json` as the source of truth.
2. Frontend vendors a copy at `contracts/openapi.json` and generates `src/types/generated/api.ts` with `openapi-typescript`.
3. Sync is an explicit developer/CI step — not an automatic cross-repo import.
4. `pnpm api:check` enforces types ↔ contract consistency.

## Consequences

- Backend contract changes do not break frontend until the contract copy is updated.
- Agents must not invent OpenAPI operations; they must sync the real file from Altium-back.
