/** Parse calendar dates locally; date-only values must never shift through UTC. */
export function parseDateFieldValue(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}(T([01]\d|2[0-3]):[0-5]\d)?$/.test(value)) return null;
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  const date = new Date(year!, month! - 1, day!, 12);
  return date.getFullYear() === year && date.getMonth() === month! - 1 && date.getDate() === day
    ? date
    : null;
}

export function localDateValue(date: Date): string {
  return [
    String(date.getFullYear()).padStart(4, '0'),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
}

export function displayDateFieldValue(value: string | null | undefined, withTime = false): string {
  if (!parseDateFieldValue(value)) return '';
  const date = value!.slice(0, 10).split('-').reverse().join('/');
  return withTime && value!.includes('T') ? `${date} ${value!.slice(11, 16)}` : date;
}
