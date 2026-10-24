# Altium CRM Frontend

Vue 3 + Vuetify frontend foundations for the Altium enterprise CRM.

> Status: **bootstrap / configuration stage** (`0.1.0`). No CRM business modules or auth yet. Minimal shell: system status + theme toggle + optional API health probe.

## Quick start

```bash
pnpm install
cp .env.development.example .env
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

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
