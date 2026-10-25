# Testing standards

## Tools

- **Vitest** + **Vue Test Utils** + jsdom for unit tests.
- **Playwright** (Chromium) for E2E flows.
- Coverage via `@vitest/coverage-v8`.

## Layout

| Kind             | Location                        |
| ---------------- | ------------------------------- |
| Unit (colocated) | `src/**/*.spec.ts`              |
| Unit (shared)    | `tests/unit/`                   |
| E2E              | `tests/e2e/`                    |
| E2E API mocks    | `tests/e2e/support/api-mock.ts` |
| Setup            | `tests/setup/vitest.setup.ts`   |

## Expectations

- Cover stores, pure helpers (guards, schemas, payload builders), the HTTP client (CSRF, 401 hook) and critical shared components.
- Form tests submit through VeeValidate and assert visible error messages.
- E2E never needs a live backend: `mockApi(page)` intercepts `/api/v1/**` and `/health` with `route.fulfill`, using shapes typed from `src/types/generated/api.ts`. Extend it per feature.
- The Vitest setup polyfills `visualViewport` / `ResizeObserver` for Vuetify overlays in jsdom.
- `pnpm check` runs unit + static gates; CI also runs Playwright after browser install.

```bash
pnpm test
pnpm build && pnpm test:e2e   # first time: pnpm exec playwright install chromium
```

`pnpm test:e2e` serves the production build (`pnpm preview`), so run `pnpm build` first when sources changed.
