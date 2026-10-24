# 0001 — Project root and initial stack

## Status

Accepted — 2026-10-24

## Context

`Altium-front` was an empty Git repository. The setup prompt suggested a nested `crm-front/` folder. The UI must integrate with a NestJS REST API and later deploy to Netlify.

## Decision

1. Place the app at the **repository root** (no nested `crm-front/`).
2. Use **Vue 3 + Vite + Vuetify 3 + Vue Router + Pinia + TanStack Vue Query** (HTTP client later refined in ADR `0004` to `openapi-fetch`).
3. Ship a minimal system-status shell with light/dark themes.
4. Prepare `netlify.toml` without connecting hosting.
5. Create shared component folders only when the first real file exists.

## Consequences

- Simple clone-and-run path.
- Future monorepo extraction needs a dedicated ADR.
- Agents must not invent business screens in this bootstrap stage.
- HTTP transport: see ADR `0004` (openapi-fetch supersedes the initial Axios choice).
