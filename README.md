# Altium CRM Frontend

Vue 3 + Vuetify frontend foundations for the Altium enterprise CRM.

> Status: **Stage 5** (`0.1.0`, unreleased changes). Cookie-session authentication against Altium-back, plus admin screens: users, teams, roles/permissions, audit and own account. No commercial CRM modules yet. See [docs/features/README.md](docs/features/README.md) and [docs/guides/authentication.md](docs/guides/authentication.md).

## Quick start

```bash
pnpm install
cp .env.development.example .env
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

For temporary access from other PCs, see [local sharing](docs/guides/local-sharing.md)
(`pnpm share:build` / `pnpm share:serve`).

## Commands

| Script               | Purpose                             |
| -------------------- | ----------------------------------- |
| `pnpm dev`           | Vite dev server                     |
| `pnpm build`         | Typecheck + production build        |
| `pnpm typecheck`     | `vue-tsc`                           |
| `pnpm lint`          | ESLint                              |
| `pnpm format:check`  | Prettier                            |
| `pnpm test`          | Unit tests (Vitest)                 |
| `pnpm test:coverage` | Coverage                            |
| `pnpm test:e2e`      | Playwright (install browsers first) |
| `pnpm docs:check`    | Documentation gates                 |
| `pnpm check:lines`   | 1000-line limit                     |
| `pnpm check`         | Mandatory validations               |

## Documentation

Start with [`AGENTS.md`](AGENTS.md), then `docs/`.

## License

UNLICENSED — private OnBroker project.
