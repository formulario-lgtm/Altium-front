# AppHeader

| Field        | Value      |
| ------------ | ---------- |
| Last updated | 2026-10-24 |
| Version      | 0.1.0      |

## Purpose

Top app bar of the authenticated shell: navigation toggle, “Altium” brand, theme toggle and user menu (change password, sessions, logout).

## Code location

`src/components/layout/AppHeader.vue`

## Props

| Prop            | Type             | Default |
| --------------- | ---------------- | ------- |
| `userName`      | `string`         | `''`    |
| `roleCode`      | `string \| null` | `null`  |
| `showNavToggle` | `boolean`        | `true`  |
| `loggingOut`    | `boolean`        | `false` |

## Events

- `toggle-nav` — open/close the navigation drawer.
- `logout` — the layout runs `useLogoutMutation`.

## Slots

None.

## Usage

```vue
<AppHeader
  :user-name="auth.displayName"
  :role-code="auth.roleCode"
  @toggle-nav="drawer = !drawer"
  @logout="logout"
/>
```

## Responsive

User name hidden below `sm` (icon only).

## Accessibility

Menu button `aria-label="Menú de usuario"`; nav icon `aria-label`.

## Dependencies

`ThemeToggleButton`, Vuetify `v-app-bar`, `v-menu`, `v-list`, Vue Router links.

## Restrictions

No HTTP or store access — data via props, actions via events.
