# Project structure

Repository root **is** the frontend app (no nested `crm-front/`). See ADR `0001`.

```text
src/
  app/plugins/          # Vuetify, Vue Query
  app/router/           # routes + router instance
  components/layout/    # shared chrome controls (create base/common when needed)
  composables/          # cross-feature composables
  config/               # env loader
  features/system-status/
  layouts/
  services/http/
  stores/
  styles/
tests/unit|e2e|setup/
docs/
netlify.toml            # future hosting (not connected)
```

## Feature module convention

```text
src/features/<feature>/
  views/
  components/      # feature-local
  composables/
  types/           # when needed
```

Mirror documentation under `docs/features/<feature>/`.

## Empty folders

Do not create empty `base/`, `common/`, `assets/`, or `utils/` stubs. Add them with the first real file.
