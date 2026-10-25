# Visual identity

Provisional Altium look: sober, flat, high legibility. Swap values without touching components.

## Sources of truth

| File                         | Role                                                                                                                 |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `src/styles/tokens.ts`       | Brand palette per theme (`altiumTokens.light` / `.dark`)                                                             |
| `src/app/plugins/vuetify.ts` | Maps tokens to Vuetify theme colors/variables + component defaults                                                   |
| `src/styles/main.scss`       | Few global helpers (`.altium-brand`, `.altium-auth-shell`, `.altium-page`, `.altium-json`, `.altium-clickable-rows`) |

## Palette

| Token             | Light     | Dark      | Vuetify color                     |
| ----------------- | --------- | --------- | --------------------------------- |
| `background`      | `#F5F6F8` | `#101D32` | `background`                      |
| `surface`         | `#FFFFFF` | `#192B45` | `surface`                         |
| `surfaceElevated` | `#FFFFFF` | `#243B5A` | `surface-bright`                  |
| `primary`         | `#243B5A` | `#4777AC` | `primary`                         |
| `textPrimary`     | `#192B45` | `#F2F6FC` | `on-background`, `on-surface`     |
| `textSecondary`   | `#657182` | `#AABCD1` | `secondary`, `on-surface-variant` |
| `border`          | `#E5EAF0` | `#2A3F5C` | `border-color`, `surface-variant` |
| `success`         | `#2F7D57` | `#3D9A6A` | `success`                         |
| `warning`         | `#A67C00` | `#C9A227` | `warning`                         |
| `error`           | `#B54040` | `#D46565` | `error`                           |
| `info`            | `#3A6EA5` | `#5B8FC7` | `info`                            |

## Locale

Vuetify runs with the Spanish locale (`es`, fallback `en`) so built-in strings (table footer, pagination, "no data") match the Spanish UI copy.

## Component defaults

Flat buttons (`elevation: 0`), bordered cards without shadow (`rounded: lg`), outlined comfortable inputs, tonal alerts, small rounded chips, hover rows in tables.

## Guidelines

- No gradients, heavy shadows or decorative cards. Use borders and spacing.
- Brand text “Altium” (`.altium-brand`) in the header and auth screens.
- Status color is never the only signal (`StatusBadge` always shows text).
- Light/dark via `ThemeToggleButton` (persisted preference `altium.ui.theme`).
- Change colors only in `tokens.ts`; keep contrast AA for text on `surface`/`background`.
