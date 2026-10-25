import type {
  SaleCustomerType,
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
  { title: 'Devuelta', value: 'RETURNED' },
];

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
