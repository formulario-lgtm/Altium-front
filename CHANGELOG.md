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

- **Inicio por rol**: pantallas personalizadas para SELLER / ADMINISTRATIVE / SUPERVISOR / SUPER_ADMIN contra `GET /api/v1/home/seller|administrative|supervisor|admin` (`home.*.read`). KPIs tipados, alertas, colas de atención, gráficos ECharts solo con datos reales, actividad reciente y accesos rápidos. Selector de período (mes actual para vendedor/administrativo; meses anteriores + equipo para supervisor/admin). Query keys por rol + usuario + período; caché limpia en login/logout.
- Componentes de home reutilizables (`HomeKpiGrid`, `HomeSection`, `HomeAlertList`, `HomeSaleList`, `HomeChartCard`, `HomeQuickActions`, `HomePeriodFilters`) reusando `KpiMetricCard` / `AltiumChart` de supervisión.
- **Módulo supervisión (frontend)**: dashboard analítico (antes embebido en Inicio; ahora la vista de supervisión en Inicio usa el home de supervisor) con filtros mes/año/equipo, KPIs documentados, gráficos ECharts; listados y detalle de vendedores y administrativos; objetivos mensuales (`supervision.goals.manage`). Contrato OpenAPI sincronizado (`/api/v1/supervision/*`).
- Dependencia `echarts` para gráficos de supervisión (ADR 0002 enmendado); paleta centralizada en `chart-theme.ts`.

### Ajuste UX/UI

- Inicio: **Accesos rápidos** al lado del saludo (`PageHeader` actions, variante `inline`) en todos los roles.
- Barra lateral del shell cerrada por defecto (se abre con el menú del header).
- Cobranza: sin aviso de “CBU pendiente”; campo **CBU/CVU/ALIAS** (dato textual). Detalle/revisión muestran el valor cargado.
- Documentación de venta: sin repetir el tipo bajo la etiqueta (`DNI frente · Titular` + `DNI frente`). Selector de plan: no muestra `A1 — A1` cuando código y nombre coinciden. Historial: motivo de borrador en español (legacy “Sale draft created” → “Borrador creado”).
- Números de venta en UI como enteros (`V-000001` → `1`); fechas en toda la app como `dd/mm/aaaa hh:mm`. En grillas de ventas: columna de fecha de creación (sin “última modificación”), orden y filtros por creación.
- **Inicio**: paneles lado a lado con misma altura de contenedor; en vendedor las alertas son operativas (sin enlace a objetivos ni aviso `NO_GOAL`, que ya está en el KPI de cumplimiento).
- **Inicio**: se eliminan la tarjeta de identidad (nombre/correo/rol), los accesos destacados a Mis sesiones y Estado del sistema, y el texto genérico sin valor operativo; la identidad queda en el header del shell.
- Etiqueta de grupo de permisos `home` → **Inicio** en Roles.
- Más aire vertical entre filas de campos y filtros (`forms.scss`: gutters de `v-row dense` con `!important` porque Vuetify pisa el padding a 4px) para que labels flotantes no queden pegados a la fila de arriba.
- Labels/placeholders de campos: blanco en oscuro y casi negro en claro; ya no pasan a azul al hacer focus (el anillo/borde sigue marcando el foco).
- **Validación de venta**: al presentar/guardar, los errores Problem Details (p. ej. CUIL inválido) marcan el campo correspondiente en rojo y muestran el mensaje bajo el input; el resumen superior usa etiquetas legibles (“Titular · CUIL”) en lugar de paths crudos.
- Contraste de etiquetas/placeholders de formularios en claro y oscuro (`forms.scss` + opacidad medium-emphasis del tema).
- **Carga global**: `GlobalLoadingOverlay` bloquea la UI con “Cargando…” mientras hay llamadas al backend (middleware del cliente HTTP; excluye el poll de no leídas). Evita pantallas “muertas” y clics repetidos.
- Etiquetas en español para grupos de permisos `administrative` → **Administrativo** y `notifications` → **Notificaciones** en Roles (ya no se muestran códigos en inglés).

### Nuevo

- **Módulo administrativo (frontend)**: dashboard operativo en Inicio (`administrative.dashboard.read`), Gestión de ventas y revisión por secciones, Seguimientos, observaciones internas / correcciones, notificaciones in-app en el header. Contrato OpenAPI sincronizado (start-review, observations, follow-ups, assignee, notifications, dashboard).
- **Documentos de venta (Spaces)**: en el alta/edición se pueden subir, descargar y eliminar adjuntos (JPEG/PNG/PDF) contra `POST/GET/DELETE /sales/:id/documents*`; el detalle permite descargar. Contrato OpenAPI sincronizado con el backend.
- Etiquetas en español para roles, tipos/estados de documento, acciones de auditoría y tipos de entidad (se dejan de mostrar códigos crudos como `SELLER` o `DNI_FRONT` en la UI).
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

- Login: un `GET /auth/me` de boot en vuelo ya no borra la sesión tras un login exitoso (carrera que dejaba la UI en `/login` aunque el POST respondiera 200).
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
