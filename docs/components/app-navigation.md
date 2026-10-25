# AppNavigation

| Field        | Value      |
| ------------ | ---------- |
| Last updated | 2026-10-24 |
| Version      | 0.1.0      |

## Purpose

Primary sidebar list. Active item uses design-system styles (`.altium-nav` + `--altium-nav-active-*`) so light and dark stay consistent.

## Code location

`src/components/layout/AppNavigation.vue`

## Props

| Prop    | Type                 |
| ------- | -------------------- |
| `items` | `readonly NavItem[]` |

Items come from `useNavigationItems()` (permission-filtered).

## Events / slots

None.

## Usage

```vue
<AppNavigation :items="items" />
```

## Responsive

Drawer permanence is owned by `AppShellLayout`.

## Accessibility

`nav` with `aria-label="Navegación principal"`; router links expose titles.

## Dependencies

Vuetify `v-list` / `v-list-item`.

## Restrictions

Do not restyle active state per feature — change `.altium-nav` in `main.scss` / tokens.
