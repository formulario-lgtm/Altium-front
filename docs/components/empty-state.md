# EmptyState

| Field        | Value      |
| ------------ | ---------- |
| Last updated | 2026-10-24 |
| Version      | 0.1.0      |

## Purpose

Centered icon + message for empty lists, tables (`#no-data`) and the forbidden page.

## Code location

`src/components/common/EmptyState.vue`

## Props

| Prop       | Type                  | Default             |
| ---------- | --------------------- | ------------------- |
| `title`    | `string`              | required            |
| `text`     | `string`              | —                   |
| `icon`     | `string` (MDI)        | `mdi-inbox-outline` |
| `titleTag` | `'p' \| 'h1' \| 'h2'` | `'p'`               |

## Slots

- `actions` — optional buttons.

## Usage

```vue
<EmptyState title="No hay usuarios" text="Ajusta la búsqueda o los filtros." />
```

## Responsive

Centered, padded block.

## Accessibility

`role="status"`. Use `titleTag="h1"` when the empty state is the whole page (forbidden).

## Dependencies

Vuetify `v-icon`.

## Restrictions

Presentational only.
