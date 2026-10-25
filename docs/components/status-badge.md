# StatusBadge

| Field        | Value      |
| ------------ | ---------- |
| Last updated | 2026-10-24 |
| Version      | 0.1.0      |

## Purpose

Tonal chip that renders a status code with a Spanish label, color and icon.

## Code location

`src/components/common/StatusBadge.vue`

## Props

| Prop     | Type     | Notes                                       |
| -------- | -------- | ------------------------------------------- |
| `status` | `string` | Code from the API (or `INACTIVE` for teams) |
| `label`  | `string` | Optional override                           |

Known codes: `PENDING`, `ACTIVE`, `SUSPENDED`, `DISABLED` (`UserStatus`), `SUCCESS`, `FAILURE` (`AuditOutcome`), `INACTIVE` (team `isActive=false`). Unknown codes render the raw code in a neutral color.

## Events / slots

None.

## Usage

```vue
<StatusBadge :status="user.status" />
<StatusBadge :status="team.isActive ? 'ACTIVE' : 'INACTIVE'" />
```

## Responsive

Inline chip.

## Accessibility

Text label always present (color is not the only signal). `data-status` attribute for tests.

## Dependencies

Vuetify `v-chip`.

## Restrictions

Add new codes here only when they exist in the OpenAPI contract.
