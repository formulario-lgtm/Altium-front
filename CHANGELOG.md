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

- Estructura inicial del frontend CRM (Vue 3, Vite, Vuetify, Router, Pinia, TanStack Query, Axios).
- Pantalla bootstrap de system status con temas claro/oscuro.
- Documentación para agentes (`AGENTS.md`), estándares, ADRs y reglas Cursor.
- Pipeline CI de validación (sin despliegue) y `netlify.toml` preparado.

### Cambios técnicos

- Tooling: TypeScript strict (`vue-tsc`), ESLint, Prettier, Vitest, Playwright, scripts `pnpm check`.
- Verificaciones de documentación y límite de 1000 líneas.

### Seguridad

- Cliente HTTP centralizado con `withCredentials`, timeouts y mapeo de errores 401/403 (sin autenticación real).
- Política de no secretos en variables `VITE_*`.

## [0.1.0] - 2026-10-24

### Nuevo

- Versión inicial de fundamentos técnicos del frontend (sin dominio CRM).
