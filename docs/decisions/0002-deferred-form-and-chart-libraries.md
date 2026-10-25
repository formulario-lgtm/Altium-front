# 0002 — Deferred form and chart libraries

## Status

Accepted — 2026-10-24. **Amended — 2026-10-24 (Stage 5):** VeeValidate + Zod installed. **Amended — 2026-10-25 (supervision):** Apache ECharts installed.

## Context

The stack mandate lists VeeValidate + Zod, Apache ECharts, and notes AG Grid may be evaluated later. Installing unused libraries increases bundle risk and maintenance without benefit during bootstrap.

## Decision

- Bootstrap (`0.1.0` foundations) did not install VeeValidate, Zod, ECharts, or AG Grid.
- Treat them as approved future choices; add packages in the same task that first uses them, with CHANGELOG + docs updates.
- Re-evaluate AG Grid when the first complex data grid is required.

## Amendment (Stage 5)

- **Installed:** `vee-validate`, `zod` (3.x), `@vee-validate/zod` — used by auth, account, users and teams forms (`useForm` + `toTypedSchema`, `defineField` with `vuetifyFieldConfig`).
- Schemas live next to their feature (`src/features/<feature>/schemas/*.ts`); the password policy mirrors the backend (`password.schema.ts`).
- **Still deferred (Stage 5):** Apache ECharts and AG Grid.

## Amendment (supervision — 2026-10-25)

- **Installed:** `echarts` — tree-shaken core + bar/line/pie + canvas renderer via `AltiumChart` (`src/features/supervision/components/AltiumChart.vue`). Palette from `chart-theme.ts` → design tokens (no per-chart hex).
- **Still deferred:** AG Grid (Vuetify `v-data-table` / `v-data-table-server` cover current tables).

## Consequences

- Smaller initial dependency tree; chart library only when a feature needs it.
- First dashboard/grid feature must include the install + ADR/changelog note.
- Agents must not add these libraries “just in case”.
