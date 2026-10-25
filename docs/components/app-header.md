# AppHeader

| Field        | Value      |
| ------------ | ---------- |
| Last updated | 2026-10-24 |
| Version      | 0.1.0      |

## Purpose

Top bar of the authenticated shell: nav toggle, `AltiumMark`, theme toggle, and user menu (pill activator with avatar + name + Spanish role, account links, logout).

## Code location

`src/components/layout/AppHeader.vue`

## Props

| Prop            | Type             | Default |
| --------------- | ---------------- | ------- |
| `userName`      | `string`         | `''`    |
| `roleCode`      | `string \| null` | `null`  |
| `showNavToggle` | `boolean`        | `true`  |
| `loggingOut`    | `boolean`        | `false` |

`roleCode` is mapped to Spanish via `roleLabel()` (`src/utils/role-labels.ts`). Technical codes are not shown in the menu.

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

On narrow viewports the activator keeps avatar + chevron; name/role text hide below `sm`.

## Accessibility

Menu `aria-label="Menú de usuario"`; nav icon `aria-label`. Avatar in the panel receives `label` when present.

## Dependencies

`AltiumMark`, `ThemeToggleButton`, `UserAvatar`, `roleLabel`, Vuetify app bar / menu / card.

## Restrictions

No HTTP or store access — data via props, actions via events. Visual tokens from the shell (`--altium-glass*`, card shadow).
