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

- **Paso 4 — validación integral ventas**: alineación de permisos UI↔API (`Presentar`/`Exportar` usan `sales.update`/`sales.read`; no existen `sales.submit`/`sales.export`), acción **Devolver** en detalle (`sales.return` + motivo), serialización de autosave para evitar carreras de `version`, smoke live de vendedores (login, IDOR, CSRF, conflicto 409).
- **Paso 3 — módulo de ventas (frontend)** contra los endpoints reales de Nest: `Mis ventas` (lista paginada + filtros), alta de borrador, formulario por secciones con reglas condicionales (tipo de venta, integrantes, laboral/impositiva, cobranza), autoguardado con `version` / conflicto 409, presentación, detalle de solo lectura y exportación Excel.
- Navegación por permisos: un SELLER ve **Mis ventas** (más cuenta/tema/logout); no se muestran Usuarios/Equipos/Roles/Auditoría sin permiso. Las rutas siguen protegidas por guards + API.
- Catálogo de prepagas/planes vía `health-insurers`; documentación y CBU marcados como pendientes de integración (sin Base64 ni localStorage de PII).
- Contrato OpenAPI sincronizado desde Altium-back e tipos regenerados para sales.
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

- Pantalla **Roles y permisos** alineada al design system: rail de roles, permisos en tarjetas por área (Usuarios, Equipos, …) con explicación en español y código técnico secundario.
- Menú de usuario del header: activador tipo píldora, panel glass con avatar/rol en español, acciones y cierre de sesión al estilo del design system.
- Controles de formulario globales (inputs, selects, autocomplete, textarea, date, switches, menús y footer de tablas) unificados en `forms.scss` + defaults de Vuetify.
- **Sistema de diseño global Altium** (claro/oscuro): paleta eléctrica/azul alineada al mock, superficies glass, atmósfera del shell, glow en botones primarios, nav activa, filtros y tipografía de página centralizados en tokens + defaults de Vuetify + `main.scss`.
- Shell autenticado: header con `AltiumMark` + avatar de iniciales (`UserAvatar`), drawer glass, badges de estado en pill con punto.
- Tablas administrativas (usuarios/equipos/auditoría) reutilizan `altium-surface-card` y `altium-filters` sin estilos por pantalla.
- Documentación de identidad visual, `docs/standards/ui-ux.md` y `AGENTS.md` obligan a reutilizar el sistema en features futuras.
- Login con layout split (marca + tarjeta glass), atmósfera adaptada a claro/oscuro y marca tipográfica provisional (`AltiumMark`).
- Tema **oscuro por defecto** en la primera visita (si no hay preferencia guardada).
- Locale de Vuetify en español (paginación y textos internos de tablas).
- Textos de interfaz y mensajes de error de la API en español (`apiErrorMessage` con copy para códigos `AUTH_*` y detalle de `409`).

### Corrección de errores

- Ventas (vendedor): pantalla en blanco al **Ver** y al **Nueva venta** (formulario) por Vuetify fuera de `optimizeDeps` (`VTable`, `VProgressCircular` en el estado de guardado; `VAutocomplete` en equipos). Lista centralizada en `scripts/vuetify-optimize-deps.ts` + gate `pnpm check:vuetify-deps` para que no vuelva a pasar en ninguna ruta lazy.
- Detalle de venta: historial con `v-list` (sin `VTimeline`).
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
