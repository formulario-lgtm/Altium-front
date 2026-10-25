# ErrorState

| Field        | Value      |
| ------------ | ---------- |
| Last updated | 2026-10-24 |
| Version      | 0.1.0      |

## Purpose

Inline error block for failed queries, with optional request reference and retry button.

## Code location

`src/components/common/ErrorState.vue`

## Props

| Prop        | Type             | Default                               |
| ----------- | ---------------- | ------------------------------------- |
| `message`   | `string`         | required (use `apiErrorMessage(err)`) |
| `title`     | `string`         | `'No se pudo cargar la información'`  |
| `requestId` | `string \| null` | `null` — shown as “Referencia”        |
| `retryable` | `boolean`        | `true`                                |
| `loading`   | `boolean`        | `false`                               |

## Events

- `retry`

## Usage

```vue
<ErrorState
  v-if="query.error.value"
  :message="apiErrorMessage(query.error.value)"
  :request-id="isApiError(query.error.value) ? query.error.value.requestId : null"
  @retry="query.refetch()"
/>
```

## Responsive

Full-width alert.

## Accessibility

`role="alert"`.

## Dependencies

Vuetify `v-alert`, `v-btn`.

## Restrictions

Only show safe messages from `apiErrorMessage` (never raw stacks or bodies).
