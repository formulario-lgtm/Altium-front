/** Fixed calendar + clock for all UI timestamps: dd/mm/aaaa hh:mm (local). */
const dateTimeFormatter = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

/** Locale date-time for ISO strings from the API; `—` for null/invalid values. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  // Intl es-AR yields "dd/mm/aaaa, hh:mm" — normalize to "dd/mm/aaaa hh:mm".
  return dateTimeFormatter.format(date).replace(',', '');
}

/**
 * Display sale numbers as plain integers (API stores e.g. `V-000001`).
 * Accepts already-numeric strings and padded values.
 */
export function formatSaleNumber(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '—';
  const raw = String(value).trim();
  const digits = raw.match(/(\d+)\s*$/);
  if (!digits?.[1]) return raw;
  const n = Number.parseInt(digits[1], 10);
  return Number.isFinite(n) ? String(n) : raw;
}

export function fullName(person: { firstName: string; lastName: string }): string {
  return `${person.firstName} ${person.lastName}`.trim();
}

/** Two-letter initials for avatars (person fields or free-form display name). */
export function initialsFromPerson(person: { firstName: string; lastName: string }): string {
  const a = person.firstName.trim().charAt(0);
  const b = person.lastName.trim().charAt(0);
  const value = `${a}${b}`.toUpperCase();
  return value || '?';
}

export function initialsFromLabel(label: string): string {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
}
