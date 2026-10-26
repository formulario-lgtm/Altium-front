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

## [0.1.0] - 2026-10-25

Primera entrega usable del CRM Altium (SPA Vue 3). Resumen por capas y roles.

### Nuevo

#### Fundamentos y shell

- Bootstrap Vite + Vue 3 + Vuetify 3 + Pinia + TanStack Query + TypeScript strict.
- Cliente HTTP `openapi-fetch` tipado con contrato vendored (`contracts/openapi.json`); Problem Details; carga global (`GlobalLoadingOverlay`).
- Sistema de diseño Altium (claro/oscuro): tokens, defaults Vuetify, shell glass, formularios unificados.
- Autenticación: login / olvidé / reset / activar; sesión cookie HttpOnly + CSRF; cuenta (password, sesiones); guards RBAC.
- Administración de plataforma: usuarios, equipos, roles/permisos, auditoría (solo lectura).
- Navegación por permisos; drawer cerrado por defecto; notificaciones in-app en el header.

#### Vendedor (`SELLER`)

- **Inicio**: KPIs del mes, pendientes/correcciones, actividad reciente (número + titular), avance vs objetivo, gráfico de presentaciones; accesos rápidos al lado del saludo (Nueva venta / Mis ventas).
- **Mis ventas**: listado con filtros; número como entero; fecha de creación `dd/mm/aaaa hh:mm`; orden/filtro por creación.
- Alta/edición de borrador por secciones (datos, integrantes, contacto, laboral/impositiva, cobranza CBU/CVU/ALIAS o tarjeta, documentos Spaces, observaciones); autoguardado con `version`; presentar / devolver / exportar Excel según permisos.
- Detalle de solo lectura: resumen, integrantes, cobranza, documentación e historial en español.

#### Administrativo (`ADMINISTRATIVE`)

- **Inicio**: prioridades de cola, alertas, actividad reciente, próximos seguimientos; accesos a gestión y seguimientos.
- **Gestión de ventas**: cola de revisión (alcance por asignaciones), detalle por secciones, iniciar revisión, observaciones internas/correcciones, seguimientos, devolver con motivo.
- Dashboard operativo administrativo y notificaciones de presentaciones/devoluciones.

#### Supervisor (`SUPERVISOR`)

- **Inicio**: KPIs de equipo, alertas, vendedores bajo ritmo, gráficos de evolución/cumplimiento; accesos a vendedores, administrativos y objetivos.
- **Supervisión**: dashboard con filtros mes/año/equipo; listados y detalle de vendedores y administrativos; **objetivos mensuales** (alta/edición/historial) sin mostrar códigos de unidad en inglés.
- Gráficos ECharts con paleta del design system.

#### Super administrador (`SUPER_ADMIN`)

- **Inicio**: resumen ejecutivo (KPIs globales, pendientes/riesgos, evolución, equipos, eventos de seguridad/admin en español); accesos a usuarios, equipos, ventas y supervisión.
- Acceso a toda la administración de plataforma + módulos comerciales/supervision según matriz de permisos.

#### Transversal ventas / UX

- Etiquetas y mensajes en español (roles, estados, documentos, auditoría, errores API).
- Documentación de venta sin etiquetas duplicadas; planes sin `A1 — A1` cuando código = nombre.
- Validación de formularios: errores de API ligados a campos; overlay de carga en mutaciones.
- Gate `pnpm check:vuetify-deps` para evitar pantallas en blanco en rutas lazy (solo afecta `pnpm dev`; el build de producción empaqueta todo).

### Ajuste UX/UI

- Homes por rol: paneles alineados, accesos rápidos inline, KPIs/listas clickeables respetando permisos, estados vacíos útiles.
- Formularios y tablas con contraste y espaciado del design system; locale Vuetify en español.
- Tema oscuro por defecto en la primera visita.

### Corrección de errores

- Carreras de sesión/login (boot `me`, 401 atrasados, CSRF stale) sin expulsar una sesión nueva.
- Primera visita a rutas lazy con Vuetify: precache en `optimizeDeps` + chequeo en CI.
- Login: `GET /auth/me` en vuelo ya no borra la sesión tras un login exitoso.

### Cambios técnicos

- Feature modules bajo `src/features/`; servicios tipados; E2E Playwright con API mock; Vitest.
- Docs de features/components/guides; `pnpm check` (typecheck, lint, format, test, build, docs, lines, vuetify-deps, api:check).
- ADR 0002: VeeValidate+Zod y ECharts en uso; AG Grid diferido.

### Seguridad

- Cookie de sesión + CSRF; sin JWT/tokens en `localStorage` (solo tema y email recordado opcional).
- Redirecciones post-login internas; redacción en detalle de auditoría; sin secretos en `VITE_*`.
