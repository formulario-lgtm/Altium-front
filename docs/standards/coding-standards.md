# Coding standards

## TypeScript / Vue

- Strict mode via `vue-tsc`.
- `<script setup lang="ts">` only for SFCs.
- Ban `any` and `@ts-ignore` unless briefly justified.
- Prefer explicit types on public composable/service APIs.

## Design

- SOLID, DRY, KISS, YAGNI.
- Thin views; logic in composables/services.
- Composition over inheritance.
- Route-level code splitting with dynamic imports.
- New Vuetify tags → update `scripts/vuetify-optimize-deps.ts` in the same task (`pnpm check:vuetify-deps`). Blank first-load of lazy routes is a regression, not an acceptable quirk.

## Size limits

- Hard max **1000** lines (`pnpm check:lines`). Generated files under `src/types/generated/` are excluded (never hand-edited or split).
- Soft target **300–500**.

## Naming

- English identifiers and file names.
- Components: `PascalCase.vue`.
- Composables: `useX.ts`.
- Stores: `*.store.ts`.

## Dependencies

Add packages only with a clear need. Prefer deferred ADRs over premature installs (forms, charts, grids).

## Formatting and line endings

Source and documentation use UTF-8 and LF, including on Windows. `.editorconfig`, `.prettierrc` and `.gitattributes` define the same convention. Run `pnpm format` to normalize existing working files, then `pnpm check` to validate the whole repository. Generated API/Prisma artifacts, dependency lockfiles and build/test output retain their existing formatter exclusions; API contract checks validate generated artifacts separately.

`pnpm check:encoding` validates UTF-8 bytes in source, tests, scripts and documentation, and rejects replacement characters. It runs first in `pnpm check`: formatter checks alone may miss Windows-1252 bytes. Optional file/directory arguments allow checking a specific path. Preserve valid Unicode accents and punctuation; save files as UTF-8 instead of replacing them with ASCII.
