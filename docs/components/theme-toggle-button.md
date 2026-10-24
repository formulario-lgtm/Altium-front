# ThemeToggleButton

| Field        | Value      |
| ------------ | ---------- |
| Last updated | 2026-10-24 |
| Version      | 0.1.0      |

## Purpose

Icon button that toggles the application light/dark theme via the UI store.

## Code location

`src/components/layout/ThemeToggleButton.vue`

## Props / events / slots

None. Uses `useUiStore` internally.

## Usage

```vue
<ThemeToggleButton />
```

## States

- Light mode → shows night icon; aria-label “Switch to dark theme”.
- Dark mode → shows sunny icon; aria-label “Switch to light theme”.

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
