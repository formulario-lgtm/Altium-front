# PageHeader

| Field        | Value      |
| ------------ | ---------- |
| Last updated | 2026-10-24 |
| Version      | 0.1.0      |

## Purpose

Consistent page title + subtitle + primary actions for authenticated views.

## Code location

`src/components/common/PageHeader.vue`

## Props

| Prop       | Type     | Notes    |
| ---------- | -------- | -------- |
| `title`    | `string` | `<h1>`   |
| `subtitle` | `string` | Optional |

## Slots

- `actions` — buttons aligned to the right (wraps below on small screens).
- `prepend` — content above the title (e.g. breadcrumbs).

## Usage

```vue
<PageHeader title="Usuarios" subtitle="Cuentas con acceso a Altium CRM.">
  <template #actions><v-btn color="primary">Nuevo usuario</v-btn></template>
</PageHeader>
```

## Responsive

Flex-wrap: actions drop under the title on narrow screens.

## Accessibility

One `<h1>` per view.

## Dependencies

None beyond Vuetify utility classes.

## Restrictions

Presentational only.
