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
