# ConfirmDialog

| Field        | Value      |
| ------------ | ---------- |
| Last updated | 2026-10-24 |
| Version      | 0.1.0      |

## Purpose

Confirmation modal for destructive or impactful actions (status changes, password links, removing members, replacing role permissions, closing sessions).

## Code location

`src/components/common/ConfirmDialog.vue`

## Props

| Prop           | Type                                | Default       |
| -------------- | ----------------------------------- | ------------- |
| `modelValue`   | `boolean`                           | `false`       |
| `title`        | `string`                            | required      |
| `message`      | `string`                            | —             |
| `confirmText`  | `string`                            | `'Confirmar'` |
| `cancelText`   | `string`                            | `'Cancelar'`  |
| `color`        | `'primary' \| 'error' \| 'warning'` | `'primary'`   |
| `loading`      | `boolean`                           | `false`       |
| `errorMessage` | `string \| null`                    | `null`        |

## Events

- `confirm` — the parent runs the mutation and closes the dialog on success.
- `cancel` — also sets `modelValue` to `false`.

## Slots

- default — extra content below `message`.

## Usage

```vue
<ConfirmDialog
  v-model="open"
  title="Suspender usuario"
  message="Se cerrarán sus sesiones."
  color="error"
  :loading="mutation.isPending.value"
  :error-message="errorText"
  @confirm="confirm"
/>
```

## States

Idle, loading (persistent, cancel disabled), error (inline alert, dialog stays open).

## Responsive

`max-width: 460px`; full width on small screens.

## Accessibility

Vuetify dialog focus trap; error alert has `role="alert"`.

## Dependencies

Vuetify `v-dialog`, `v-card`, `v-alert`, `v-btn`.

## Restrictions

No HTTP inside; the parent owns the mutation.
