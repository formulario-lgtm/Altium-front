import type { SupervisionCompliance } from '@/services/http';

/** Documented alert thresholds (aligned with backend supervision dashboard). */
export const SUPERVISION_ALERT_THRESHOLDS = {
  overdueFollowUpsWarn: 5,
  overdueFollowUpsCritical: 10,
  returnedStockWarn: 10,
} as const;

export const MONTH_OPTIONS = [
  { title: 'Enero', value: 1 },
  { title: 'Febrero', value: 2 },
  { title: 'Marzo', value: 3 },
  { title: 'Abril', value: 4 },
  { title: 'Mayo', value: 5 },
  { title: 'Junio', value: 6 },
  { title: 'Julio', value: 7 },
  { title: 'Agosto', value: 8 },
  { title: 'Septiembre', value: 9 },
  { title: 'Octubre', value: 10 },
  { title: 'Noviembre', value: 11 },
  { title: 'Diciembre', value: 12 },
] as const;

export const GOAL_TYPE_OPTIONS = [
  {
    title: 'Ventas presentadas',
    value: 'SALES_SUBMITTED' as const,
    unit: 'COUNT' as const,
    hint: 'Primeras presentaciones del mes (una por venta).',
  },
  {
    title: 'Revisiones iniciadas',
    value: 'REVIEWS_STARTED' as const,
    unit: 'COUNT' as const,
    hint: 'Eventos SUBMITTED→IN_REVIEW del administrativo.',
  },
  {
    title: 'Horas hasta 1ª revisión',
    value: 'FIRST_REVIEW_HOURS' as const,
    unit: 'HOURS' as const,
    hint: 'Promedio de horas entre primera presentación y primer IN_REVIEW.',
  },
] as const;

export const KPI_HELP = {
  salesPresented:
    'Ventas distintas cuya primera presentación ocurrió en el mes (no cuenta re-presentaciones).',
  compliance:
    'Ventas presentadas ÷ objetivo mensual × 100. Si no hay objetivo se muestra “Sin objetivo”, nunca 0% inventado.',
  returnedStock: 'Ventas que están ahora en estado Devuelta (stock actual, no el evento del mes).',
  returnsInPeriod: 'Ventas distintas con al menos una devolución registrada durante el mes.',
  returnRate:
    'Entre las primeras presentaciones del mes, cuántas tuvieron alguna devolución hasta hoy.',
  pendingReview: 'Ventas actualmente Presentadas, pendientes de intervención administrativa.',
  inReview: 'Ventas actualmente En revisión.',
  followUpsPending: 'Seguimientos OPEN con próxima fecha futura o sin fecha.',
  followUpsOverdue: 'Seguimientos OPEN con próxima fecha ≤ ahora.',
} as const;

export function formatCompliance(compliance: SupervisionCompliance | null | undefined): string {
  if (!compliance || !compliance.hasGoal) return 'Sin objetivo';
  if (compliance.targetIsZero) return 'Objetivo en cero';
  if (compliance.compliancePercent === null || compliance.compliancePercent === undefined) {
    return 'Sin objetivo';
  }
  return `${Math.round(compliance.compliancePercent)}%`;
}

export function formatPercent(value: number | null | undefined, digits = 0): string {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(digits)}%`;
}

export function formatHours(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${value.toFixed(1)} h`;
}

export function personName(firstName: string, lastName: string): string {
  return `${lastName}, ${firstName}`.trim();
}

export function currentBusinessYearMonth(now = new Date()): { year: number; month: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(now);
  return {
    year: Number(parts.find((p) => p.type === 'year')?.value),
    month: Number(parts.find((p) => p.type === 'month')?.value),
  };
}

export function isClosedPeriod(year: number, month: number, now = new Date()): boolean {
  const current = currentBusinessYearMonth(now);
  return year < current.year || (year === current.year && month < current.month);
}

export function yearOptions(span = 4): number[] {
  const { year } = currentBusinessYearMonth();
  return Array.from({ length: span }, (_, i) => year - i + 1).filter((y) => y <= year + 1);
}

export function saleStatusLabel(status: string): string {
  const map: Record<string, string> = {
    DRAFT: 'Borrador',
    SUBMITTED: 'Presentada',
    IN_REVIEW: 'En revisión',
    RETURNED: 'Devuelta',
  };
  return map[status] ?? status;
}
