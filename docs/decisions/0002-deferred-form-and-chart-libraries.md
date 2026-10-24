# 0002 — Deferred form and chart libraries

## Status

Accepted — 2026-10-24

## Context

The stack mandate lists VeeValidate + Zod, Apache ECharts, and notes AG Grid may be evaluated later. Installing unused libraries increases bundle risk and maintenance without benefit during bootstrap.

## Decision

- **Do not install** VeeValidate, Zod, ECharts, or AG Grid in `0.1.0`.
- Treat them as approved future choices; add packages in the same task that first uses them, with CHANGELOG + docs updates.
- Re-evaluate AG Grid when the first complex data grid is required.

## Consequences

- Smaller initial dependency tree.
- First form/dashboard/grid feature must include the install + ADR/changelog note.
- Agents must not add these libraries “just in case”.
