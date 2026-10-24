# Development guide

## Prerequisites

- Node.js ≥ 20.19
- pnpm 10
- Optional: Playwright browsers for E2E

## Setup

```bash
pnpm install
cp .env.development.example .env
pnpm dev
```

App: [http://localhost:5173](http://localhost:5173)

Optional API health: start Altium-back and set `VITE_ENABLE_HEALTH_CHECK=true`.

## Validation

```bash
pnpm check
pnpm exec playwright install chromium
pnpm test:e2e
```

## Agreements

Follow `AGENTS.md`. Keep changes scoped. Update feature docs + CHANGELOG with behavioral changes.
