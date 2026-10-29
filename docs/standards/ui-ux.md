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

| Pattern         | Implementation                                                                                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page chrome     | `PageHeader` + `v-btn color="primary"` for CTA                                                                                                                      |
| Filters         | `v-row.altium-filters` + outlined fields (global defaults / `forms.scss`)                                                                                           |
| Forms           | Rely on Vuetify defaults; avoid local `density`/`variant` unless required. Vertical spacing between field rows is global in `forms.scss` (do not patch per screen). |
| Multi-step form | Side nav (`SaleSectionNav`) on desktop; compact select on mobile                                                                                                    |
| Save feedback   | Inline status (pending / saving / saved / error) — never silent fail                                                                                                |
| Data lists      | `v-card` > `v-data-table-server`                                                                                                                                    |
| Status          | `StatusBadge` (includes sale `DRAFT` / `SUBMITTED` / `RETURNED`)                                                                                                    |
| Person identity | `UserAvatar` + name/email stack                                                                                                                                     |
| Blocking load   | `GlobalLoadingOverlay` for foreground calls; narrowly scoped background form work uses inline state (see [loading](../components/global-loading-overlay.md))        |
| Shell           | `AppShellLayout` (atmosphere + glass drawer/bar)                                                                                                                    |

## Rules

- Prefer Vuetify components before custom ones.
- No unnecessary feature-scoped global styles.
- Keep business screens uncluttered; one primary action per view when possible.

## Lazy routes: no blank first load (mandatory)

Route views are code-split. With `vite-plugin-vuetify` auto-import, the **first** navigation that pulls in a Vuetify component not yet in Vite `optimizeDeps` triggers dependency re-optimization and a **full page reload** (blank white screen, often bouncing to `/`). This must **never** ship for any screen (Mis ventas, nueva venta, detalle, edición, admin, auth).

1. Source of truth: [`scripts/vuetify-optimize-deps.ts`](../../scripts/vuetify-optimize-deps.ts) (imported by `vite.config.ts`).
2. When adding a new `<v-*>` in any SFC under `src/`:
   - Prefer a component already listed there.
   - If new: add `vuetify/components/V…` to `vuetifyOptimizeDeps` **and** map the kebab tag in `TAG_TO_OPTIMIZE_ENTRY`.
3. Gate: `pnpm check:vuetify-deps` (part of `pnpm check`) fails if a tag is used without an entry.
4. After changing the list, restart `pnpm dev` so Vite re-prebundles.

## Calendar fields

Use `DateField` from `src/components/common` for dates and local date/time fields. Keep ISO calendar values in state and let the component format the display. Avoid browser-native date inputs: their popup cannot consistently follow Altium themes. See [DateField](../components/date-field.md).
