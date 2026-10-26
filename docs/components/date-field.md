# DateField

Shared date / local date-time field built with the standard Vuetify text field, menu and date picker. Replaces browser-native date popups so both Altium themes use the same palette, typography and calendar layout.

## API

- `modelValue?: string | null`; emits `update:modelValue` with `YYYY-MM-DD`, `YYYY-MM-DDTHH:mm`, or an empty string when cleared. Calendar dates use local year/month/day without UTC conversion.
- `label` (required); `type`: `date` (default) or `datetime-local`.
- `disabled`, `readonly`, `clearable` (default true), optional ISO calendar `min` / `max`.
- Standard text-field attributes such as required, error-messages, hint and persistent-hint are forwarded to the field.

Read-only display uses `dd/mm/aaaa` and optional `hh:mm`. Click anywhere on the control or its right-aligned calendar button to open. Enter, Space and ArrowDown also open it; Escape and outside click dismiss it. Vuetify supplies keyboard navigation and month/year selection. Date selection commits immediately; date/time selection requires Aplicar and Cancelar discards the draft. Borrar clears the model. Disabled/read-only fields cannot open or update values.

## Styling and responsive behavior

Uses design-system Vuetify defaults and surface/primary tokens. Layout rules live in `src/styles/forms.scss` under Shared date fields and calendar. The popup fits the viewport; no browser-native date indicator or popup is used. The time input inside the popup inherits the active theme's color-scheme.

`VDatePicker` is registered in `scripts/vuetify-optimize-deps.ts`; keep the entry when adding usages on lazy routes. Restart an existing Vite development server after changing optimizeDeps.

## Usage and tests

Used in sales/admin sales filters, audit filters, birth date/FUM, and administrative follow-up timestamps. Presentation and HTTP formats remain separate: local date-time values are converted to ISO timestamps by the consuming feature before submission.

Unit: `date-field-value.spec.ts` checks local-date preservation, invalid dates/times and leap dates. E2E: `date-field.spec.ts` checks both themes on desktop/mobile, opening from the right edge/keyboard/icon, selecting and clearing, and date-time apply/cancel.
