# UserAvatar

| Field        | Value      |
| ------------ | ---------- |
| Last updated | 2026-10-24 |
| Version      | 0.1.0      |

## Purpose

Circular avatar showing two-letter initials. Used in the app header user menu and identity columns (e.g. users table). Colors come from `--altium-avatar-bg` / `--altium-avatar-fg` (theme tokens).

## Code location

`src/components/common/UserAvatar.vue`

## Props

| Prop       | Type               | Default     |
| ---------- | ------------------ | ----------- |
| `initials` | `string`           | required    |
| `size`     | `number \| string` | `40`        |
| `label`    | `string`           | `undefined` |

Compute initials with `initialsFromPerson` / `initialsFromLabel` from `src/utils/format.ts`.

## Events / slots

None.

## Usage

```vue
<UserAvatar :initials="initialsFromPerson(user)" :size="40" />
<UserAvatar :initials="initialsFromLabel(displayName)" :size="34" :label="displayName" />
```

## Responsive

Fixed size; parent layout truncates adjacent text.

## Accessibility

Decorative by default (`aria-hidden`). Pass `label` when the avatar is the sole name cue.

## Dependencies

Vuetify `v-avatar`.

## Restrictions

Do not hardcode avatar background colors in features — change token CSS vars instead.
