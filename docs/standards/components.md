# Component standards

## Categories

| Kind            | Location                               | Docs                         |
| --------------- | -------------------------------------- | ---------------------------- |
| Feature-local   | `src/features/<feature>/components/`   | Feature Markdown             |
| Global reusable | `src/components/{base,common,layout}/` | `docs/components/<name>.md`  |
| Layout shells   | `src/layouts/`                         | Feature or architecture docs |

## Promotion rule

A component becomes global only when reused (or clearly about to be) across features.

## Global component docs must include

Purpose, path, props, events, slots, examples, states, responsive behavior, a11y, dependencies, restrictions.

## Implementation tips

- Keep presentational components free of HTTP.
- Use props/emits or composables for behavior.
- Favor small, single-purpose SFCs.
