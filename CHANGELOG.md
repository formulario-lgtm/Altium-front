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

- **Etapa 5 — autenticación y administración** contra Altium-back (sesión por cookie HttpOnly + CSRF double submit).
- Pantallas de acceso: `/login` (recordar correo opcional), `/forgot-password` (mensaje neutro anti-enumeración), `/reset-password?token=`, `/activate?token=`.
- Shell autenticado con navegación por permisos: inicio (bienvenida, rol y accesos rápidos, sin KPIs), `/account/change-password` (incluye cambio forzado por `mustChangePassword`), `/account/sessions`.
- Administración: `/users` (paginación offset, búsqueda, filtros, alta/edición, cambio de estado y envío de enlaces con confirmación), `/teams` y `/teams/:id` (supervisor, miembros, históricos), `/roles` (permisos agrupados por recurso, protección de SUPER_ADMIN), `/audit` (tabla de solo lectura + detalle con JSON saneado).
- Páginas `/forbidden` y `/system` dentro del shell; not-found público.
- Componentes globales: `AppHeader`, `AppNavigation`, `PageHeader`, `StatusBadge`, `ConfirmDialog`, `EmptyState`, `ErrorState`, `PasswordField`.
- Formularios con VeeValidate + Zod; política de contraseña alineada con el backend (12–128, mayúscula, minúscula, número).
- Documentación de features (auth, account, home, users, teams, roles, audit), guía de autenticación frontend, identidad visual y componentes.
- Integración contract-first con OpenAPI del backend (`contracts/openapi.json` + tipos generados).
- Scripts `pnpm api:generate` / `pnpm api:check`.
- Normalización de errores Problem Details (RFC 9457) y convenciones TanStack Query.
- Documentación de integración API, cliente HTTP y generación de tipos.

### Ajuste UX/UI

- Tokens de marca Altium (`src/styles/tokens.ts`) aplicados a los temas claro/oscuro de Vuetify; estética sobria sin sombras ni gradientes.
- Login con layout split (marca + tarjeta glass), atmósfera adaptada a claro/oscuro y marca tipográfica provisional (`AltiumMark`).
- Tema **oscuro por defecto** en la primera visita (si no hay preferencia guardada).
- Locale de Vuetify en español (paginación y textos internos de tablas).
- Textos de interfaz y mensajes de error de la API en español (`apiErrorMessage` con copy para códigos `AUTH_*` y detalle de `409`).

### Corrección de errores

- Evitado el reload en blanco al abrir por primera vez pantallas lazy (Auditoría, Usuarios, etc.): Vite precachea los componentes de Vuetify en `optimizeDeps`.

### Cambios técnicos

- Servicios tipados `auth`, `users`, `teams`, `roles`, `audit` sobre `openapi-fetch`; `parseEmptyResult` para respuestas `204`; alias de tipos generados en `api-types.ts`.
- Store Pinia `auth.store` (usuario, permisos, sesión, estado, `hasPermission` / `hasAnyPermission`), guards de router (`requiresAuth`, `guestOnly`, `permissions`, cambio de contraseña obligatorio) y `appQueryClient` compartido.
- Contrato OpenAPI sincronizado desde Altium-back y tipos regenerados.
- Instalados `vee-validate`, `zod` y `@vee-validate/zod` (ADR 0002 enmendado; ECharts y AG Grid siguen diferidos).
- E2E Playwright con API simulada tipada (`tests/e2e/support/api-mock.ts`): login correcto/incorrecto, redirección protegida, logout con CSRF, tema y listado de usuarios.
- `docs:check` exige la documentación nueva de features, componentes y guías.
- `check:lines` excluye `src/types/generated/**` (archivo generado del contrato, no editable).

- Cliente HTTP migrado de Axios a `openapi-fetch` (fetch nativo) tipado con OpenAPI.
- Timeouts y cancelación mediante `AbortController` (`createTimedFetch`).
- `openapi-typescript` para generar `src/types/generated/api.ts`.
- Query keys y QueryClient compartidos; health tipado desde el contrato.
- Tooling: TypeScript strict (`vue-tsc`), ESLint, Prettier, Vitest, Playwright, `pnpm check`.

### Seguridad

- `credentials: 'include'` para la cookie de sesión HttpOnly; header `x-csrf-token` en métodos mutantes desde un almacén en memoria (fallback a la cookie `altium_csrf`).
- Manejo central de `401`: limpia sesión, CSRF y caché de Query y redirige a `/login?redirect=` sin bucles.
- Redirecciones post-login restringidas a rutas internas; nada de sesión, tokens ni contraseñas en `localStorage` (solo tema y correo recordado opcional).
- Redacción defensiva de claves sensibles en el detalle de auditoría.
- `x-request-id`, timeouts y mensajes de error seguros (Problem Details, sin stacks).
- Política de no secretos en variables `VITE_*`.

## [0.1.0] - 2026-10-24

### Nuevo

- Versión inicial de fundamentos técnicos del frontend (sin dominio CRM).
