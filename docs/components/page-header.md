# PageHeader

| Field        | Value      |
| ------------ | ---------- |
| Last updated | 2026-10-24 |
| Version      | 0.1.0      |

## Purpose

Standard page title block: design-system title/subtitle typography plus optional primary actions (e.g. “Nuevo usuario”).

## Code location

`src/components/common/PageHeader.vue`

## Props

| Prop       | Type                |
| ---------- | ------------------- |
| `title`    | `string`            |
| `subtitle` | `string` (optional) |

## Slots

| Slot      | Use                          |
| --------- | ---------------------------- |
| `prepend` | Optional content above title |
| `actions` | Primary/secondary buttons    |

## Usage

```vue
<PageHeader title="Usuarios" subtitle="Cuentas con acceso a Altium CRM.">
  <template #actions>
    <v-btn color="primary" prepend-icon="mdi-account-plus-outline">Nuevo usuario</v-btn>
  </template>
</PageHeader>
```

Primary actions: `color="primary"` (glow comes from global SCSS). Do not invent local page-title CSS.

## Responsive

Actions wrap under the title on narrow viewports.

## Accessibility

Single `h1` per page via this component.

## Dependencies

Global classes `.altium-page-title` / `.altium-page-subtitle`.
