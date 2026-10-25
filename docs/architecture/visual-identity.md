# Visual identity — Altium design system

Canonical look for the authenticated CRM shell and shared UI. Auth marketing (`AuthLayout`) may use local CSS variables for atmosphere, but **shared chrome must use these tokens**.

## Sources of truth

| File                         | Role                                                                                                           |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `src/styles/tokens.ts`       | Brand palette (`altiumTokens.light` / `.dark`) + radii                                                         |
| `src/app/plugins/vuetify.ts` | Maps tokens → Vuetify theme colors/variables + **component defaults** (design-system variants)                 |
| `src/styles/main.scss`       | Theme CSS vars (`--altium-*`), shell atmosphere, cards, nav active, primary glow                               |
| `src/styles/forms.scss`      | Global fields, selects, date inputs, menus, switches, **field-row spacing**, table footer / dialog form chrome |

**Rule for agents:** never invent one-off hex colors, card styles, or button variants in feature views. Change the system (tokens → Vuetify → global SCSS) so every screen stays consistent.

## Palette

| Token             | Light     | Dark      | Vuetify                           |
| ----------------- | --------- | --------- | --------------------------------- |
| `background`      | `#EEF3F9` | `#07101F` | `background`                      |
| `surface`         | `#FFFFFF` | `#0E1B35` | `surface`                         |
| `surfaceElevated` | `#FFFFFF` | `#152748` | `surface-bright`                  |
| `primary`         | `#2563EB` | `#3B82F6` | `primary`                         |
| `textPrimary`     | `#15233A` | `#F4F7FC` | `on-background`, `on-surface`     |
| `textSecondary`   | `#5F7088` | `#9EB0C9` | `secondary`, `on-surface-variant` |
| `border`          | `#D8E2EF` | `#243B5A` | `border-color`, `surface-variant` |
| `success`         | `#059669` | `#34D399` | `success`                         |
| `warning`         | `#D97706` | `#FBBF24` | `warning`                         |
| `error`           | `#DC2626` | `#F87171` | `error`                           |
| `info`            | `#2563EB` | `#60A5FA` | `info`                            |

CSS extras (not Vuetify colors): `--altium-glass`, `--altium-glass-border`, `--altium-glow-primary`, `--altium-card-shadow`, `--altium-nav-active-bg`, `--altium-avatar-bg/fg`, `--altium-radius-*`.

## Locale

Vuetify Spanish locale (`es`, fallback `en`) for table footer / pagination / empty copy.

## Component defaults (variants)

Configured once in `createVuetifyPlugin()`:

| Component                                                                                 | Default                                                                               |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `VBtn`                                                                                    | `rounded="lg"`, flat, `text-none`; primary gets soft glow via SCSS                    |
| `VCard`                                                                                   | `rounded="xl"`, border, class `altium-surface-card` (glass)                           |
| Fields (`VTextField`, `VSelect`, `VAutocomplete`, `VCombobox`, `VTextarea`, `VFileInput`) | `outlined`, `comfortable`, `rounded="lg"`, `color="primary"` — chrome in `forms.scss` |
| Selection (`VCheckbox`, `VRadio`, `VSwitch`)                                              | `color="primary"`, `comfortable`; switches `inset`                                    |
| `VChip`                                                                                   | `rounded="pill"`, `size="small"`                                                      |
| Tables                                                                                    | `hover`; wrap in `v-card` for surface treatment                                       |
| `VAlert`                                                                                  | `tonal`, `rounded="lg"`                                                               |

### Shared wrappers (prefer these)

| Need                | Use                                                                         |
| ------------------- | --------------------------------------------------------------------------- |
| Page title/actions  | `PageHeader`                                                                |
| Status pills        | `StatusBadge`                                                               |
| User initials       | `UserAvatar` + `initialsFromPerson` / `initialsFromLabel`                   |
| Confirm destructive | `ConfirmDialog`                                                             |
| Empty / error       | `EmptyState` / `ErrorState`                                                 |
| Blocking API wait   | `GlobalLoadingOverlay` (HTTP middleware; do not invent per-screen blockers) |
| Filter row          | `v-row.altium-filters` + default fields                                     |
| Shell chrome        | `AppShellLayout` + `AppHeader` + `AppNavigation` + `ThemeToggleButton`      |

Do **not** create parallel buttons, badges, or table skins per feature.

## Shell

- Atmosphere (glows + dots) behind the authenticated app (`altium-shell`).
- Glass drawer and app bar; active nav item uses `--altium-nav-active-*`.
- Light and dark share the same structure; only tokens/atmosphere intensity change.

## Guidelines

- Prefer borders + glass + soft primary glow over heavy elevation stacks.
- Status color is never the only signal (`StatusBadge` always shows text + dot).
- Theme via `ThemeToggleButton` (persisted `altium.ui.theme`; default dark).
- Keep contrast AA for text on `surface` / `background`.
- New screens: reuse defaults first; extend tokens/defaults before adding local CSS.
