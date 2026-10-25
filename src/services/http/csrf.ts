/**
 * In-memory CSRF token for the backend double-submit check.
 * Never persisted to localStorage/sessionStorage.
 */
export const CSRF_HEADER = 'x-csrf-token';
export const CSRF_COOKIE = 'altium_csrf';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

let csrfToken: string | null = null;

export function setCsrfToken(token: string | null | undefined): void {
  csrfToken = token && token.length > 0 ? token : null;
}

export function clearCsrfToken(): void {
  csrfToken = null;
}

/** Reads the non-HttpOnly CSRF cookie when the API shares the SPA site. */
export function readCsrfCookie(cookieSource?: string): string | null {
  const source = cookieSource ?? (typeof document !== 'undefined' ? document.cookie : '');
  if (!source) {
    return null;
  }

  for (const part of source.split(';')) {
    const [rawName, ...rest] = part.trim().split('=');
    if (rawName === CSRF_COOKIE) {
      const value = rest.join('=');
      if (!value) {
        return null;
      }
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    }
  }
  return null;
}

/** Memory first, then the readable cookie as fallback. */
export function getCsrfToken(): string | null {
  return csrfToken ?? readCsrfCookie();
}

export function isMutatingMethod(method: string): boolean {
  return MUTATING_METHODS.has(method.toUpperCase());
}

/**
 * Header object for typed mutating operations (the contract declares `x-csrf-token` as required).
 * The client middleware also fills it in, so an empty value here is overwritten when a token exists.
 */
export function csrfHeaders(): { [CSRF_HEADER]: string } {
  return { [CSRF_HEADER]: getCsrfToken() ?? '' };
}
