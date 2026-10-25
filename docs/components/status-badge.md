# StatusBadge

| Field        | Value      |
| ------------ | ---------- |
| Last updated | 2026-10-24 |
| Version      | 0.1.0      |

## Purpose

Pill tonal chip for API status codes: colored soft background, solid dot, Spanish label. Part of the Altium design system — reuse everywhere instead of ad-hoc chips.

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

Text label always present (color is not the only signal). `data-status` for tests.

## Dependencies

Vuetify `v-chip` (tonal + pill via design-system defaults).

## Restrictions

Add new codes only when they exist in the OpenAPI contract.
