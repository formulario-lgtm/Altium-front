# OpenAPI types guide

## Commands

```bash
pnpm api:generate   # contracts/openapi.json → src/types/generated/api.ts
pnpm api:check      # fails if generated types drift
```

Included in `pnpm check` and CI.

## Usage example

```ts
import type { paths } from '@/types/generated/api';

type HealthOk = paths['/health']['get']['responses']['200']['content']['application/json'];
```

## Updating after backend changes

1. Obtain the new `openapi/openapi.json` from Altium-back (do not invent endpoints).
2. Replace `contracts/openapi.json`.
3. `pnpm api:generate && pnpm api:check`.
4. Fix any TypeScript breakages in services/composables.
5. Update feature docs + CHANGELOG.

## Forbidden

- Manual edits to `src/types/generated/**`
- Duplicate hand-written interfaces for the same OpenAPI schemas
- Fetching production OpenAPI at runtime for type generation
