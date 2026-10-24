# TanStack Query conventions

## Ownership

- **TanStack Query** = remote/server state and cache.
- **Pinia** = UI/app state (theme, layout). Never mirror API entities in both.

## Defaults

Configured in `src/app/plugins/query-client.ts`:

- `staleTime`: 30s
- `gcTime`: 5m
- `retry`: 1 (disabled for 401/403)
- `refetchOnWindowFocus`: false
- mutations: no retry

## Query keys

Use hierarchical factories in `src/services/http/query-keys.ts`:

```ts
queryKeys.system.health(); // ['system', 'health']
```

Add feature namespaces as modules land (`queryKeys.customers.list(filters)`).

## Feature composables

Place data hooks under `src/features/<feature>/composables/`. Keep HTTP in services; composables wrap `useQuery` / `useMutation`.
