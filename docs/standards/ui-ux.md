# UX / UI standards

## Design system (mandatory)

Altium has a **single design system** for light and dark themes. Agents and humans must reuse it on every screen.

1. Colors / radii → `src/styles/tokens.ts`
2. Vuetify theme + component defaults → `src/app/plugins/vuetify.ts`
3. Shell, cards, nav, primary glow → `src/styles/main.scss` (`--altium-*`)
4. Inputs / selects / dates / menus / switches → `src/styles/forms.scss` (do not restyle per feature)
5. Shared building blocks → `src/components/common` + `src/components/layout` (see `docs/components/`)

Full reference: [visual-identity.md](../architecture/visual-identity.md).

**Do not** hardcode hex colors, duplicate button/badge/table skins, or invent a second visual language per feature. Prefer configuring Vuetify defaults over new custom widgets.

## Principles

- Clarity and hierarchy over decoration.
- Same component appearance in every module.
- Visible loading, useful empty states, clear errors.
- Confirm destructive actions (`ConfirmDialog`).
- Keyboard focus and AA contrast.
- Responsive: desktop, tablet, mobile.

## Patterns

| Pattern         | Implementation                                                            |
| --------------- | ------------------------------------------------------------------------- |
| Page chrome     | `PageHeader` + `v-btn color="primary"` for CTA                            |
| Filters         | `v-row.altium-filters` + outlined fields (global defaults / `forms.scss`) |
| Forms           | Rely on Vuetify defaults; avoid local `density`/`variant` unless required |
| Data lists      | `v-card` > `v-data-table-server`                                          |
| Status          | `StatusBadge`                                                             |
| Person identity | `UserAvatar` + name/email stack                                           |
| Shell           | `AppShellLayout` (atmosphere + glass drawer/bar)                          |

## Rules

- Prefer Vuetify components before custom ones.
- No unnecessary feature-scoped global styles.
- Keep business screens uncluttered; one primary action per view when possible.
