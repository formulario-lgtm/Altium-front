import { afterEach, describe, expect, it } from 'vitest';
import {
  clearCsrfToken,
  CSRF_HEADER,
  csrfHeaders,
  getCsrfToken,
  isMutatingMethod,
  readCsrfCookie,
  setCsrfToken,
} from './csrf';

function clearCookie(): void {
  document.cookie = 'altium_csrf=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
}

describe('csrf token store', () => {
  afterEach(() => {
    clearCsrfToken();
    clearCookie();
  });

  it('keeps the token in memory only', () => {
    setCsrfToken('memory-token');
    expect(getCsrfToken()).toBe('memory-token');
    expect(window.localStorage.length).toBe(0);
    expect(window.sessionStorage.length).toBe(0);
  });

  it('clears the token', () => {
    setCsrfToken('memory-token');
    clearCsrfToken();
    expect(getCsrfToken()).toBeNull();
  });

  it('falls back to the readable altium_csrf cookie', () => {
    document.cookie = 'altium_csrf=cookie%20token; path=/';
    expect(getCsrfToken()).toBe('cookie token');
  });

  it('prefers memory over cookie', () => {
    document.cookie = 'altium_csrf=cookie-token; path=/';
    setCsrfToken('memory-token');
    expect(getCsrfToken()).toBe('memory-token');
  });

  it('parses cookie strings with other cookies', () => {
    expect(readCsrfCookie('a=1; altium_csrf=abc=def; b=2')).toBe('abc=def');
    expect(readCsrfCookie('a=1')).toBeNull();
    expect(readCsrfCookie('')).toBeNull();
  });

  it('identifies mutating methods', () => {
    expect(['POST', 'put', 'PATCH', 'delete'].every(isMutatingMethod)).toBe(true);
    expect(isMutatingMethod('GET')).toBe(false);
    expect(isMutatingMethod('HEAD')).toBe(false);
  });

  it('builds the typed header object', () => {
    expect(csrfHeaders()).toEqual({ [CSRF_HEADER]: '' });
    setCsrfToken('abc');
    expect(csrfHeaders()).toEqual({ 'x-csrf-token': 'abc' });
  });
});
