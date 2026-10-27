import { isFeatureRouteEnabled } from '@/config/features';
import type { RouteLocationRaw, Router } from 'vue-router';
import type { HomeAlert, HomePeriodTeamQuery } from '@/services/http';

export function withHomePeriod(
  to: RouteLocationRaw | null,
  period?: HomePeriodTeamQuery,
): RouteLocationRaw | null {
  if (!to || !period || typeof to === 'string') return to;
  return { ...to, query: { ...to.query, ...period } };
}

/** A summary may be visible even when the user cannot open its management screen. */
export function accessibleHomeRoute(
  router: Pick<Router, 'resolve'>,
  to: RouteLocationRaw | null,
  hasPermission: (code: string) => boolean,
): RouteLocationRaw | null {
  return to &&
    isFeatureRouteEnabled(router.resolve(to).name) &&
    (router.resolve(to).meta.permissions ?? []).every(hasPermission)
    ? to
    : null;
}

export type HomeQuickAction = {
  key: string;
  title: string;
  description?: string;
  icon: string;
  to: RouteLocationRaw;
  permission?: string;
};

export function sellerKpiRoute(code: string): RouteLocationRaw | null {
  switch (code) {
    case 'RETURNED_STOCK':
      return { name: 'sales', query: { status: 'RETURNED' } };
    case 'DRAFTS':
      return { name: 'sales', query: { status: 'DRAFT' } };
    case 'SALES_PRESENTED':
    case 'COMPLIANCE':
      return { name: 'sales' };
    default:
      return null;
  }
}

export function administrativeKpiRoute(code: string): RouteLocationRaw | null {
  switch (code) {
    case 'PENDING_REVIEW':
      return { name: 'admin-sales', query: { status: 'SUBMITTED' } };
    case 'IN_REVIEW':
      return { name: 'admin-sales', query: { status: 'IN_REVIEW' } };
    case 'RETURNED_STOCK':
      return { name: 'admin-sales', query: { status: 'RETURNED' } };
    case 'OVERDUE_FOLLOW_UPS':
      return { name: 'admin-follow-ups' };
    default:
      return null;
  }
}

export function supervisorKpiRoute(code: string): RouteLocationRaw | null {
  switch (code) {
    case 'SALES_PRESENTED':
    case 'COMPLIANCE':
    case 'BEHIND_PACE':
      return { name: 'supervision-sellers' };
    case 'PENDING_ADMIN':
      return { name: 'admin-sales' };
    default:
      return null;
  }
}

export function adminKpiRoute(code: string): RouteLocationRaw | null {
  switch (code) {
    case 'SALES_PRESENTED':
      return { name: 'admin-sales' };
    case 'COMPLIANCE':
      return { name: 'supervision-goals' };
    case 'PENDING_OPS':
      return { name: 'admin-sales', query: { status: 'SUBMITTED' } };
    case 'ACTIVE_USERS':
      return { name: 'users' };
    default:
      return null;
  }
}

/**
 * Destination for an alert chip. Returns null when the alert is informational
 * only for that role (e.g. sellers cannot open objectives).
 */
export function alertRoute(alert: HomeAlert, variant: string): RouteLocationRaw | null {
  switch (alert.code) {
    case 'CORRECTIONS_REQUIRED':
    case 'RETURNED_STOCK':
      return variant === 'seller'
        ? { name: 'sales', query: { status: 'RETURNED' } }
        : { name: 'admin-sales', query: { status: 'RETURNED' } };
    case 'PENDING_REVIEW':
    case 'STALE_SUBMITTED':
      if (variant === 'seller') return null;
      return { name: 'admin-sales', query: { status: 'SUBMITTED' } };
    case 'OVERDUE_FOLLOW_UPS':
      if (variant === 'seller') return null;
      return { name: 'admin-follow-ups' };
    case 'BEHIND_PACE':
      if (variant === 'seller' || variant === 'administrative') return null;
      return { name: 'supervision-sellers' };
    case 'TEAMS_WITHOUT_GOAL':
    case 'NO_GOAL':
      // Goals UI requires supervision.* — never send sellers/administratives there.
      if (variant === 'supervisor' || variant === 'admin') {
        return { name: 'supervision-goals' };
      }
      return null;
    case 'PENDING_ACTIVATION':
    case 'SUSPENDED_USERS':
      if (variant !== 'admin') return null;
      return { name: 'users' };
    default:
      if (alert.entityType === 'sale' && alert.entityId) {
        return variant === 'seller' || variant === 'fallback'
          ? { name: 'sale-detail', params: { id: alert.entityId } }
          : { name: 'admin-sale-review', params: { id: alert.entityId } };
      }
      return null;
  }
}

/** Seller alerts focused on actionable sales work (goal info lives in KPIs). */
export function sellerOperationalAlerts(alerts: readonly HomeAlert[]): HomeAlert[] {
  return alerts.filter((alert) => alert.code !== 'NO_GOAL');
}

export const SELLER_QUICK_ACTIONS: HomeQuickAction[] = [
  {
    key: 'sale-new',
    title: 'Nueva venta',
    description: 'Crear un borrador',
    icon: 'mdi-plus-circle-outline',
    to: { name: 'sale-new' },
    permission: 'sales.create',
  },
  {
    key: 'sales',
    title: 'Mis ventas',
    description: 'Listado y filtros',
    icon: 'mdi-clipboard-text-outline',
    to: { name: 'sales' },
    permission: 'sales.read',
  },
];

export const ADMINISTRATIVE_QUICK_ACTIONS: HomeQuickAction[] = [
  {
    key: 'admin-sales',
    title: 'Gestión de ventas',
    description: 'Cola de revisión',
    icon: 'mdi-clipboard-check-outline',
    to: { name: 'admin-sales' },
    permission: 'sales.review',
  },
  {
    key: 'admin-follow-ups',
    title: 'Seguimientos',
    description: 'Próximas gestiones',
    icon: 'mdi-calendar-clock',
    to: { name: 'admin-follow-ups' },
    permission: 'sales.follow_up',
  },
];

export const SUPERVISOR_QUICK_ACTIONS: HomeQuickAction[] = [
  {
    key: 'teams',
    title: 'Equipos',
    description: 'Personas de tus equipos',
    icon: 'mdi-account-group-outline',
    to: { name: 'teams' },
    permission: 'teams.read',
  },

  {
    key: 'sellers',
    title: 'Vendedores',
    description: 'Ventas y estados del mes',
    icon: 'mdi-account-tie',
    to: { name: 'supervision-sellers' },
    permission: 'supervision.analytics.read',
  },
  {
    key: 'administratives',
    title: 'Administrativos',
    description: 'Carga operativa',
    icon: 'mdi-account-hard-hat',
    to: { name: 'supervision-administratives' },
    permission: 'supervision.analytics.read',
  },
];

export const ADMIN_QUICK_ACTIONS: HomeQuickAction[] = [
  {
    key: 'users',
    title: 'Usuarios',
    icon: 'mdi-account-group-outline',
    to: { name: 'users' },
    permission: 'users.read',
  },
  {
    key: 'teams',
    title: 'Equipos',
    icon: 'mdi-account-multiple-outline',
    to: { name: 'teams' },
    permission: 'teams.read',
  },
  {
    key: 'admin-sales',
    title: 'Gestión de ventas',
    icon: 'mdi-clipboard-text-outline',
    to: { name: 'admin-sales' },
    permission: 'sales.review',
  },
  {
    key: 'supervision',
    title: 'Supervisión',
    icon: 'mdi-chart-timeline-variant',
    to: { name: 'supervision-sellers' },
    permission: 'supervision.analytics.read',
  },
  {
    key: 'audit',
    title: 'Auditoría',
    icon: 'mdi-history',
    to: { name: 'audit' },
    permission: 'audit.read',
  },
];
