import type {
  AuditLogQuery,
  HomePeriodQuery,
  HomePeriodTeamQuery,
  NotificationListQuery,
  SaleListQuery,
  SupervisionAdministrativeListQuery,
  SupervisionGoalsQuery,
  SupervisionPeriodQuery,
  SupervisionSellerListQuery,
  TeamListQuery,
  UserListQuery,
} from './api-types';

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
    observations: (id: string) => [...queryKeys.sales.all, 'observations', id] as const,
    followUps: (id: string) => [...queryKeys.sales.all, 'follow-ups', id] as const,
  },
  administrative: {
    all: ['administrative'] as const,
    dashboard: () => [...queryKeys.administrative.all, 'dashboard'] as const,
  },
  supervision: {
    all: ['supervision'] as const,
    dashboard: (query: SupervisionPeriodQuery) =>
      [...queryKeys.supervision.all, 'dashboard', query] as const,
    sellers: (query: SupervisionSellerListQuery) =>
      [...queryKeys.supervision.all, 'sellers', query] as const,
    seller: (id: string, query: SupervisionPeriodQuery) =>
      [...queryKeys.supervision.all, 'seller', id, query] as const,
    comparison: (query: SupervisionPeriodQuery & { sellerIds: string[] }) =>
      [...queryKeys.supervision.all, 'comparison', query] as const,
    administratives: (query: SupervisionAdministrativeListQuery) =>
      [...queryKeys.supervision.all, 'administratives', query] as const,
    administrative: (id: string, query: SupervisionPeriodQuery) =>
      [...queryKeys.supervision.all, 'administrative', id, query] as const,
    goals: (query: SupervisionGoalsQuery) =>
      [...queryKeys.supervision.all, 'goals', query] as const,
    goalHistory: (id: string) => [...queryKeys.supervision.all, 'goal-history', id] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (query: NotificationListQuery) =>
      [...queryKeys.notifications.all, 'list', query] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
  },
  home: {
    all: ['home'] as const,
    seller: (userId: string, query: HomePeriodQuery) =>
      [...queryKeys.home.all, 'seller', userId, query] as const,
    administrative: (userId: string, query: HomePeriodQuery) =>
      [...queryKeys.home.all, 'administrative', userId, query] as const,
    supervisor: (userId: string, query: HomePeriodTeamQuery) =>
      [...queryKeys.home.all, 'supervisor', userId, query] as const,
    admin: (userId: string, query: HomePeriodTeamQuery) =>
      [...queryKeys.home.all, 'admin', userId, query] as const,
  },
} as const;
