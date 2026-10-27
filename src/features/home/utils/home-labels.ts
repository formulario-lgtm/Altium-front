import type { HomeCompliance, HomeKpi } from '@/services/http';
import { MONTH_OPTIONS } from '@/features/supervision/utils/supervision-labels';

export type HomeRoleVariant = 'seller' | 'administrative' | 'supervisor' | 'admin' | 'fallback';

/** Prefer the account role; permission priority is the fallback for custom role configurations. */
export const HOME_PERMISSION_PRIORITY = [
  { permission: 'home.admin.read', variant: 'admin' as const },
  { permission: 'home.supervisor.read', variant: 'supervisor' as const },
  { permission: 'home.administrative.read', variant: 'administrative' as const },
  { permission: 'home.seller.read', variant: 'seller' as const },
] as const;

export const HOME_KPI_ICONS: Record<string, string> = {
  SALES_PRESENTED: 'mdi-chart-line',
  REVIEWS_STARTED: 'mdi-clipboard-check-outline',
  APPROVED: 'mdi-check-circle-outline',
  REJECTED: 'mdi-close-circle-outline',
  COMPLIANCE: 'mdi-target',
  RETURNED_STOCK: 'mdi-backup-restore',
  DRAFTS: 'mdi-file-document-edit-outline',
  PENDING_REVIEW: 'mdi-inbox-arrow-down',
  IN_REVIEW: 'mdi-clipboard-search-outline',
  OVERDUE_FOLLOW_UPS: 'mdi-calendar-alert',
  BEHIND_PACE: 'mdi-account-alert-outline',
  PENDING_ADMIN: 'mdi-clipboard-list-outline',
  PENDING_OPS: 'mdi-clipboard-list-outline',
  ACTIVE_USERS: 'mdi-account-check-outline',
};

export const HOME_ALERT_SEVERITY_COLOR: Record<'info' | 'warning' | 'critical', string> = {
  info: 'info',
  warning: 'warning',
  critical: 'error',
};

export function resolveHomeVariant(
  hasPermission: (code: string) => boolean,
  roleCode?: string | null,
): HomeRoleVariant {
  const preferred: Record<string, HomeRoleVariant> = {
    SUPER_ADMIN: 'admin',
    SUPERVISOR: 'supervisor',
    ADMINISTRATIVE: 'administrative',
    SELLER: 'seller',
  };
  const role = roleCode ? preferred[roleCode] : undefined;
  if (role && hasPermission(`home.${role}.read`)) return role;
  for (const entry of HOME_PERMISSION_PRIORITY) {
    if (hasPermission(entry.permission)) return entry.variant;
  }
  return 'fallback';
}

export function formatHomeCompliance(compliance: HomeCompliance | null | undefined): string {
  if (!compliance || !compliance.hasGoal) return 'Sin objetivo';
  if (compliance.targetIsZero) return 'Objetivo en cero';
  if (compliance.compliancePercent === null || compliance.compliancePercent === undefined) {
    return 'Sin objetivo';
  }
  return `${Math.round(compliance.compliancePercent)}%`;
}

export function formatHomeKpiValue(kpi: HomeKpi): string {
  if (kpi.availability === 'NO_GOAL' || kpi.availability === 'NOT_IMPLEMENTED') {
    return kpi.unit === 'PERCENT' ? 'Sin objetivo' : '—';
  }
  if (kpi.availability === 'NO_DATA' || kpi.value === null || kpi.value === undefined) {
    return '—';
  }
  if (kpi.unit === 'PERCENT') return `${Math.round(kpi.value)}%`;
  if (kpi.unit === 'HOURS') return `${kpi.value.toFixed(1)} h`;
  return String(Math.round(kpi.value));
}

export function formatHomeKpiHint(kpi: HomeKpi): string {
  if (kpi.availability === 'NO_GOAL') return 'Sin objetivo configurado';
  if (kpi.availability === 'NO_DATA') return 'Sin datos en el período';
  if (kpi.availability === 'NOT_IMPLEMENTED') return 'No disponible';
  if (kpi.delta !== null && kpi.delta !== undefined && kpi.previousValue !== null) {
    const sign = kpi.delta > 0 ? '+' : '';
    if (kpi.unit === 'PERCENT') return `${sign}${Math.round(kpi.delta)} pp vs período anterior`;
    return `${sign}${Math.round(kpi.delta)} vs período anterior`;
  }
  if (kpi.availability === 'ZERO') return 'Sin movimientos';
  return 'Período seleccionado';
}

export function periodLabel(year: number, month: number): string {
  const name = MONTH_OPTIONS.find((m) => m.value === month)?.title ?? String(month);
  return `${name} ${year}`;
}

export function homeKpiIcon(code: string): string {
  return HOME_KPI_ICONS[code] ?? 'mdi-chart-box-outline';
}
