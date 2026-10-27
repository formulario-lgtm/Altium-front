# ThemeToggleButton

| Field        | Value      |
| ------------ | ---------- |
| Last updated | 2026-10-24 |
| Version      | 0.1.0      |

## Purpose

Icon button that toggles the application light/dark theme via the UI store. Present in `AuthLayout` and `AppHeader`.

## Code location

`src/components/layout/ThemeToggleButton.vue`

## Props / events / slots

None. Uses `useUiStore` internally.

## Usage

```vue
<ThemeToggleButton />
```

## States

- Light mode → night icon; aria-label “Cambiar a tema oscuro”.
- Dark mode → sunny icon; aria-label “Cambiar a tema claro”.

## Responsive

Icon button; usable on all breakpoints.

## Accessibility

- `aria-label` and `title` describe the action.
- Native button focus via Vuetify `v-btn`.

## Dependencies

- Pinia `useUiStore`
- Vuetify `v-btn`, `v-icon`, MDI

## Restrictions

- Do not call HTTP from this component.
- Theme persistence is limited to a non-sensitive preference key in `localStorage` (`altium.ui.theme`).
- Colors come from `src/styles/tokens.ts` — see [visual identity](../architecture/visual-identity.md).

Theme synchronization runs once in `App.vue` so the theme also applies during initial navigation and layout changes. Auth theme overrides remain scoped to their intended descendants. The app root must retain opacity 1 while toggling or reloading either theme; login E2E coverage checks the effective colors instead of only the button label.
