const dateTimeFormatter = new Intl.DateTimeFormat('es', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

/** Locale date-time for ISO strings from the API; `—` for null/invalid values. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormatter.format(date);
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
