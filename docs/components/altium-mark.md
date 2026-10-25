# AltiumMark

Provisional brand mark + optional wordmark for Altium. Not a final institutional logo.

## Path

`src/components/layout/AltiumMark.vue`

## Props

| Prop           | Type                           | Default | Description                                              |
| -------------- | ------------------------------ | ------- | -------------------------------------------------------- |
| `withWordmark` | boolean                        | `true`  | Show the “Altium” text                                   |
| `size`         | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'`  | Glyph and wordmark scale (`xl` on the login brand panel) |

## Usage

Used on the guest shell (`AuthLayout`) branding panel and mobile toolbar. Colors follow Vuetify theme tokens (`primary` / `on-background`).
