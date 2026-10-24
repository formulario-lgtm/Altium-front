# 0004 — Prefer openapi-fetch over Axios

## Status

Accepted — 2026-10-24

## Context

Step 3B initially used Axios plus hand-typed helpers. The HTTP stack already generates OpenAPI types with `openapi-typescript`. Axios does not consume those path types natively and adds a second HTTP abstraction.

## Decision

1. Replace Axios with **`openapi-fetch`** (native `fetch`).
2. Keep **TanStack Vue Query** for remote cache/state.
3. Implement timeouts with **`AbortController`** (`createTimedFetch`), mergeable with Query cancellation signals.
4. Keep Problem Details normalization and `credentials: 'include'` for future cookie auth.

## Consequences

- Endpoint calls are typed as `client.GET('/path')` against generated `paths`.
- Agents must not reintroduce Axios without a new ADR.
- CSRF header injection will plug into the existing openapi-fetch middleware when auth lands.
