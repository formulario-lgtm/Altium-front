# UX / UI standards

## Design system

- Vuetify 3 themes: light + dark (`src/app/plugins/vuetify.ts`).
- MDI icons via Vuetify icon set.
- Tokens (colors, defaults) centralized — avoid one-off global CSS.
- Visual identity is provisional; refine later without rewriting architecture.

## Principles

- Clarity over decoration.
- Consistent form patterns (when forms land).
- Visible loading, useful empty states, clear errors.
- Confirm destructive actions.
- Keyboard focus and adequate contrast.
- Responsive: desktop, tablet, mobile.

## Rules

- Prefer Vuetify components before custom ones.
- No unnecessary global styles.
- Keep business screens uncluttered; one primary action per view when possible.
