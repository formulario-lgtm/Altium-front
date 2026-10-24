# API integration

## Contract-first

`Altium-back` owns the OpenAPI document. This frontend keeps an explicit copy at:

`contracts/openapi.json`

TypeScript types are generated into:

`src/types/generated/api.ts`

Never edit generated files by hand. Never invent parallel DTO interfaces for backend resources.

## Sync procedure (reproducible)

1. In **Altium-back**: `pnpm openapi:generate` (commit `openapi/openapi.json` there).
2. Copy that file into this repo as `contracts/openapi.json` (no sibling-path imports in CI).
3. Here: `pnpm api:generate` then `pnpm api:check`.
4. Commit both the contract copy and the regenerated types together.

Later we may automate the copy via GitHub Actions artifacts; until then the sync is intentional.

## Runtime stack

| Concern                 | Module                                   |
| ----------------------- | ---------------------------------------- |
| Env / base URL          | `src/config/env.ts`, `src/config/api.ts` |
| openapi-fetch client    | `src/services/http/client.ts`            |
| Timeout / AbortSignal   | `src/services/http/timed-fetch.ts`       |
| Problem Details mapping | `src/services/http/errors.ts`            |
| Feature services        | `src/services/http/*.service.ts`         |
| TanStack Query          | `src/app/plugins/query-client.ts`        |
| Query keys              | `src/services/http/query-keys.ts`        |

Components must not call `fetch` / `apiClient` directly — go through feature services + Query composables.
