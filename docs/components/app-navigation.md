# AppNavigation

| Field        | Value      |
| ------------ | ---------- |
| Last updated | 2026-10-24 |
| Version      | 0.1.0      |

## Purpose

Main navigation list rendered inside the shell drawer.

## Code location

`src/components/layout/AppNavigation.vue`

## Props

| Prop    | Type                 | Notes                                    |
| ------- | -------------------- | ---------------------------------------- |
| `items` | `readonly NavItem[]` | Already filtered by `useNavigationItems` |

`NavItem` lives in `src/app/navigation.ts` (`title`, `icon`, `routeName`, `description?`).

## Events / slots

None.

## Visibility by permission

`useNavigationItems()` keeps an item when the user holds every code in the target route's `meta.permissions` (single source of truth with the router guard):

| Item             | Route   | Required permission |
| ---------------- | ------- | ------------------- |
| Inicio           | `home`  | —                   |
| Usuarios         | `users` | `users.read`        |
| Equipos          | `teams` | `teams.read`        |
| Roles y permisos | `roles` | `roles.read`        |
| Auditoría        | `audit` | `audit.read`        |

## Usage

```vue
<AppNavigation :items="items" />
```

## Responsive

Permanent drawer on `md+`, temporary (overlay) drawer on smaller screens (handled by `AppShellLayout`).

## Accessibility

Wrapped in `<nav aria-label="Navegación principal">`; active route highlighted by Vuetify.

## Dependencies

Vuetify `v-list`, Vue Router.

## Restrictions

Hidden nav is a UX aid only; the backend enforces permissions.
