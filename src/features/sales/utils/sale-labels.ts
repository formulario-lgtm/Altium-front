import type {
  SaleCustomerType,
  SaleDocumentStatus,
  SaleDocumentType,
  SaleMaritalStatus,
  SaleMemberSex,
  SaleMemberType,
  SalePaymentMethod,
  SaleStatus,
} from '@/services/http';

export const CUSTOMER_TYPE_OPTIONS: { title: string; value: SaleCustomerType }[] = [
  { title: 'Desregulado', value: 'DEREGULATED' },
  { title: 'Monotributista', value: 'MONOTAX' },
  { title: 'Voluntario', value: 'VOLUNTARY' },
];

export const SALE_STATUS_OPTIONS: { title: string; value: SaleStatus }[] = [
  { title: 'Borrador', value: 'DRAFT' },
  { title: 'Presentada', value: 'SUBMITTED' },
  { title: 'En revisión', value: 'IN_REVIEW' },
  { title: 'Devuelta', value: 'RETURNED' },
];

/** Statuses shown in the administrative sales queue (excludes drafts). */
export const ADMIN_SALE_STATUS_OPTIONS: { title: string; value: SaleStatus }[] = [
  { title: 'Presentada', value: 'SUBMITTED' },
  { title: 'En revisión', value: 'IN_REVIEW' },
  { title: 'Devuelta', value: 'RETURNED' },
];

export const FOLLOW_UP_TYPE_OPTIONS = [
  { title: 'Llamada', value: 'CALL' as const },
  { title: 'Correo', value: 'EMAIL' as const },
  { title: 'Portal', value: 'PORTAL' as const },
  { title: 'Otro', value: 'OTHER' as const },
];

export function saleStatusLabel(value: SaleStatus | null | undefined): string {
  return SALE_STATUS_OPTIONS.find((option) => option.value === value)?.title ?? value ?? '—';
}

export function followUpTypeLabel(value: string | null | undefined): string {
  return FOLLOW_UP_TYPE_OPTIONS.find((option) => option.value === value)?.title ?? value ?? '—';
}

export function observationTypeLabel(value: string | null | undefined): string {
  if (value === 'INTERNAL_NOTE') return 'Nota interna';
  if (value === 'CORRECTION_REQUEST') return 'Solicitud de corrección';
  return value ?? '—';
}

export function observationStatusLabel(value: string | null | undefined): string {
  if (value === 'OPEN') return 'Abierta';
  if (value === 'RESOLVED') return 'Resuelta';
  return value ?? '—';
}

export function canStartReview(status: SaleStatus | undefined): boolean {
  return status === 'SUBMITTED';
}

export function canReturnForCorrection(status: SaleStatus | undefined): boolean {
  return status === 'SUBMITTED' || status === 'IN_REVIEW';
}

export function canRegisterAdminActions(status: SaleStatus | undefined): boolean {
  return status === 'SUBMITTED' || status === 'IN_REVIEW' || status === 'RETURNED';
}

export const SEX_OPTIONS: { title: string; value: SaleMemberSex }[] = [
  { title: 'Femenino', value: 'FEMALE' },
  { title: 'Masculino', value: 'MALE' },
  { title: 'Otro', value: 'OTHER' },
];

export const MARITAL_OPTIONS: { title: string; value: SaleMaritalStatus }[] = [
  { title: 'Soltero/a', value: 'SINGLE' },
  { title: 'Casado/a', value: 'MARRIED' },
  { title: 'Divorciado/a', value: 'DIVORCED' },
  { title: 'Convivencia', value: 'COHABITING' },
  { title: 'Viudo/a', value: 'WIDOWED' },
  { title: 'Otro', value: 'OTHER' },
];

export const PAYMENT_METHOD_OPTIONS: { title: string; value: SalePaymentMethod }[] = [
  { title: 'Tarjeta', value: 'CARD' },
  { title: 'CBU', value: 'CBU' },
];

export const MONOTAX_CATEGORIES = 'ABCDEFGHIJK'.split('').map((letter) => ({
  title: letter,
  value: letter,
}));

export const ARGENTINA_PROVINCES: string[] = [
  'CABA',
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
];

export function customerTypeLabel(value: SaleCustomerType | null | undefined): string {
  return CUSTOMER_TYPE_OPTIONS.find((option) => option.value === value)?.title ?? '—';
}

export function memberTypeLabel(value: SaleMemberType): string {
  if (value === 'HOLDER') return 'Titular';
  if (value === 'SPOUSE') return 'Cónyuge';
  return 'Hijo/a';
}

export const DOCUMENT_TYPE_LABELS: Record<SaleDocumentType, string> = {
  PAYSLIP: 'Recibo de sueldo',
  DNI_FRONT: 'DNI frente',
  DNI_BACK: 'DNI dorso',
  BIRTH_CERTIFICATE: 'Partida de nacimiento',
  MONOTAX_FORM: 'Formulario monotributo',
  PAYMENT_PROOF: 'Comprobante de pago',
  OTHER: 'Otro',
};

export const DOCUMENT_STATUS_LABELS: Record<SaleDocumentStatus, string> = {
  PENDING: 'Pendiente',
  UPLOADED: 'Subido',
  FAILED: 'Fallido',
};

export function documentTypeLabel(value: SaleDocumentType | string): string {
  return DOCUMENT_TYPE_LABELS[value as SaleDocumentType] ?? value;
}

export function documentStatusLabel(value: SaleDocumentStatus | string): string {
  return DOCUMENT_STATUS_LABELS[value as SaleDocumentStatus] ?? value;
}

/** Plan select label: avoid `A1 — A1` when code and name match. */
export function healthPlanOptionLabel(plan: { code: string; name: string }): string {
  const code = plan.code.trim();
  const name = plan.name.trim();
  if (!code) return name || '—';
  if (!name || code.toLowerCase() === name.toLowerCase()) return code || name;
  return `${code} — ${name}`;
}

/** System status-history reasons (API may still return legacy English). */
const SALE_HISTORY_REASON_LABELS: Record<string, string> = {
  'Sale draft created': 'Borrador creado',
  'Borrador creado': 'Borrador creado',
};

export function saleHistoryReasonLabel(reason: string | null | undefined): string | null {
  if (!reason) return null;
  const trimmed = reason.trim();
  if (!trimmed) return null;
  return SALE_HISTORY_REASON_LABELS[trimmed] ?? trimmed;
}

/** Accept JPEG / PNG / PDF up to 10 MiB (matches backend default). */
export const SALE_DOCUMENT_ACCEPT = 'image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf';
export const SALE_DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;

export function formatFileSize(bytes: number | null | undefined): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ageFromBirthDate(birthDate: string | null | undefined): number | null {
  if (!birthDate) return null;
  const birth = new Date(`${birthDate.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  const todayNoon = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0);
  if (birth > todayNoon) return null;
  let age = todayNoon.getFullYear() - birth.getFullYear();
  const monthDiff = todayNoon.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && todayNoon.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

export function showFum(
  sex: SaleMemberSex | null | undefined,
  birthDate: string | null | undefined,
): boolean {
  return sex === 'FEMALE' && (ageFromBirthDate(birthDate) ?? 0) > 12;
}

export function canEditSaleStatus(status: SaleStatus | undefined): boolean {
  return status === 'DRAFT' || status === 'RETURNED';
}
