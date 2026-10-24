# Documentation standards

## Sources of truth

| Topic              | Location                          |
| ------------------ | --------------------------------- |
| Agent entry        | `AGENTS.md`                       |
| Features           | `docs/features/`                  |
| Global components  | `docs/components/`                |
| Standards / guides | `docs/standards/`, `docs/guides/` |
| Decisions          | `docs/decisions/`                 |

## Feature Markdown checklist

Name, goal, route, expected behavior, components, composables/stores, services/endpoints, validations, loading/empty/error, permissions, business rules, interactions, responsive notes, tests, last updated.

## Process

1. Document new sections when implementing them.
2. Update docs when behavior changes.
3. Never describe unimplemented CRM features as shipped.
4. Keep indexes current.
5. Same task as code.
6. Agents read only relevant files.
