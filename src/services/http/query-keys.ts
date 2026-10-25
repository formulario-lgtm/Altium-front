import type { AuditLogQuery, SaleListQuery, TeamListQuery, UserListQuery } from './api-types';

/**
 * Hierarchical query keys.
 * Example: queryKeys.system.health() → ['system', 'health']
 * The authenticated session itself lives in the auth Pinia store, not in Query.
 */
export const queryKeys = {
  system: {
    all: ['system'] as const,
    health: () => [...queryKeys.system.all, 'health'] as const,
  },
  auth: {
    all: ['auth'] as const,
    sessions: () => [...queryKeys.auth.all, 'sessions'] as const,
  },
  users: {
    all: ['users'] as const,
    list: (query: UserListQuery) => [...queryKeys.users.all, 'list', query] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
  },
  teams: {
    all: ['teams'] as const,
    list: (query: TeamListQuery) => [...queryKeys.teams.all, 'list', query] as const,
    detail: (id: string) => [...queryKeys.teams.all, 'detail', id] as const,
    members: (id: string, includeFormer: boolean) =>
      [...queryKeys.teams.all, 'members', id, { includeFormer }] as const,
  },
  roles: {
    all: ['roles'] as const,
    list: () => [...queryKeys.roles.all, 'list'] as const,
    permissions: () => [...queryKeys.roles.all, 'permissions'] as const,
  },
  audit: {
    all: ['audit'] as const,
    list: (query: AuditLogQuery) => [...queryKeys.audit.all, 'list', query] as const,
  },
  healthInsurers: {
    all: ['health-insurers'] as const,
    list: () => [...queryKeys.healthInsurers.all, 'list'] as const,
    plans: (insurerId: string) => [...queryKeys.healthInsurers.all, 'plans', insurerId] as const,
  },
  sales: {
    all: ['sales'] as const,
    list: (query: SaleListQuery) => [...queryKeys.sales.all, 'list', query] as const,
    detail: (id: string) => [...queryKeys.sales.all, 'detail', id] as const,
    documents: (id: string) => [...queryKeys.sales.all, 'documents', id] as const,
    history: (id: string) => [...queryKeys.sales.all, 'history', id] as const,
  },
} as const;
