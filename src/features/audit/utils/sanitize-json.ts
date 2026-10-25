/**
 * Defensive display-side redaction for audit payloads. The backend already strips secrets
 * before storing; this guards against regressions and keeps the drawer readable.
 */
const SENSITIVE_KEY = /pass(word)?|hash|token|cookie|secret|authorization|csrf|api[-_]?key/i;
const MAX_DEPTH = 6;
export const REDACTED = '[redactado]';

function sanitizeValue(value: unknown, depth: number): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (depth >= MAX_DEPTH) {
    return '[…]';
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, depth + 1));
  }
  const output: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    output[key] = SENSITIVE_KEY.test(key) ? REDACTED : sanitizeValue(nested, depth + 1);
  }
  return output;
}

export function sanitizeAuditPayload(value: unknown): unknown {
  return sanitizeValue(value, 0);
}

export function formatAuditPayload(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  return JSON.stringify(sanitizeAuditPayload(value), null, 2);
}
