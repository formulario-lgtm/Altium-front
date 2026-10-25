# PasswordField

| Field        | Value      |
| ------------ | ---------- |
| Last updated | 2026-10-24 |
| Version      | 0.1.0      |

## Purpose

Password input with a show/hide toggle. Used by login, activation, reset and change-password forms.

## Code location

`src/components/common/PasswordField.vue`

## Props

| Prop               | Type                                   | Default              | Notes                           |
| ------------------ | -------------------------------------- | -------------------- | ------------------------------- |
| `modelValue`       | `string`                               | `''`                 | `v-model`                       |
| `label`            | `string`                               | `'Contraseña'`       |                                 |
| `autocomplete`     | `'current-password' \| 'new-password'` | `'current-password'` | Password manager hint           |
| `errorMessages`    | `string \| string[]`                   | `[]`                 | Bound from VeeValidate          |
| `hint`             | `string`                               | —                    | Shown persistently when present |
| `name`, `disabled` | `string`, `boolean`                    | —, `false`           |                                 |

## Events

- `update:modelValue` (via `defineModel`)
- `blur` — forwarded so VeeValidate can validate on blur.

## Slots

None.

## Usage

```vue
<PasswordField
  v-model="newPassword"
  v-bind="newPasswordProps"
  label="Nueva contraseña"
  autocomplete="new-password"
  :hint="PASSWORD_POLICY_HINT"
/>
```

## States

Hidden (default, `type="password"`) / visible (`type="text"`); error messages under the field.

## Responsive

Full width of its container.

## Accessibility

- Toggle button has `aria-label` “Mostrar/Ocultar contraseña” and `aria-pressed`.
- `autocapitalize="off"` and `spellcheck="false"`.

## Dependencies

Vuetify `v-text-field`, `v-btn`, MDI.

## Restrictions

- Never persist or log the value. No HTTP.
- The component does not validate; pass errors from the form schema.
