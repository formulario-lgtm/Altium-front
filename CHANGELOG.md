# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Section headings used in this repository:

- Nuevo
- Ajuste UX/UI
- Corrección de errores
- Cambios técnicos
- Seguridad
- Deprecado / Eliminado

## [Unreleased]

### Nuevo

- Integración contract-first con OpenAPI del backend (`contracts/openapi.json` + tipos generados).
- Scripts `pnpm api:generate` / `pnpm api:check`.
- Normalización de errores Problem Details (RFC 9457) y convenciones TanStack Query.
- Documentación de integración API, cliente HTTP y generación de tipos.

### Cambios técnicos

- Cliente HTTP migrado de Axios a `openapi-fetch` (fetch nativo) tipado con OpenAPI.
- Timeouts y cancelación mediante `AbortController` (`createTimedFetch`).
- `openapi-typescript` para generar `src/types/generated/api.ts`.
- Query keys y QueryClient compartidos; health tipado desde el contrato.
- Tooling: TypeScript strict (`vue-tsc`), ESLint, Prettier, Vitest, Playwright, `pnpm check`.

### Seguridad

- `credentials: 'include'` preparado para cookies HttpOnly; middleware listo para CSRF futuro.
- `x-request-id`, timeouts y mensajes de error seguros (Problem Details, sin stacks).
- Política de no secretos en variables `VITE_*`.

## [0.1.0] - 2026-10-24

### Nuevo

- Versión inicial de fundamentos técnicos del frontend (sin dominio CRM).
