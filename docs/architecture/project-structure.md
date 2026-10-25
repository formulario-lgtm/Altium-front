# Project structure

Repository root **is** the frontend app (no nested `crm-front/`). See ADR `0001`.

```text
src/
  app/plugins/          # Vuetify, Vue Query (shared appQueryClient)
  app/router/           # routes, guards (auth/permissions), route meta typing
  app/navigation.ts     # nav items (visibility from route meta.permissions)
  app/session.ts        # 401 handler wiring (store + router + Query)
  components/common/    # PageHeader, StatusBadge, ConfirmDialog, EmptyState, ErrorState, PasswordField
  components/layout/    # AppHeader, AppNavigation, ThemeToggleButton
  composables/          # cross-feature composables (theme, navigation, debounce, form helpers)
  config/               # env loader
  features/
    auth/ account/ home/ users/ teams/ roles/ audit/ system-status/
  layouts/              # AuthLayout (guest), AppShellLayout (authenticated)
  services/http/        # openapi-fetch client, csrf, services per resource, query keys
  stores/               # ui.store (theme), auth.store (session)
  styles/               # tokens.ts, main.scss, settings.scss
  utils/                # small pure helpers (formatting)
tests/unit|e2e|setup/
tests/e2e/support/      # typed API mocks (Playwright route.fulfill)
docs/
netlify.toml            # future hosting (not connected)
```

## Feature module convention

```text
src/features/<feature>/
  views/
  components/      # feature-local
  composables/     # Query hooks / view state
  schemas/         # Zod schemas (VeeValidate)
  utils/           # pure helpers (unit-tested)
```

Mirror documentation under `docs/features/<feature>/`.

## Empty folders

Do not create empty `base/`, `assets/` or similar stubs. Add them with the first real file.
