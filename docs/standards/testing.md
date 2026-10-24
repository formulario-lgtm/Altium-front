# Testing standards

## Tools

- **Vitest** + **Vue Test Utils** + jsdom for unit tests.
- **Playwright** (Chromium) for E2E smoke flows.
- Coverage via `@vitest/coverage-v8`.

## Layout

| Kind             | Location                      |
| ---------------- | ----------------------------- |
| Unit (colocated) | `src/**/*.spec.ts`            |
| Unit (shared)    | `tests/unit/`                 |
| E2E              | `tests/e2e/`                  |
| Setup            | `tests/setup/vitest.setup.ts` |

## Expectations

- Cover stores, pure config/helpers, and critical shared components.
- E2E covers shell navigation/theme at minimum; expand per feature.
- `pnpm check` runs unit + static gates; CI also runs Playwright after browser install.

```bash
pnpm test
pnpm test:e2e   # pnpm exec playwright install chromium
```
