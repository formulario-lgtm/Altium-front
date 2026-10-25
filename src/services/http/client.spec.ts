import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createApiClient,
  onUnauthorized,
  parseApiResult,
  parseEmptyResult,
  REQUEST_ID_HEADER,
} from './client';
import { clearCsrfToken, getCsrfToken, setCsrfToken } from './csrf';
import { isApiError } from './errors';

function problem(status: number, code: string): Response {
  return new Response(JSON.stringify({ type: 'about:blank', title: code, status, code }), {
    status,
    headers: { 'content-type': 'application/problem+json' },
  });
}

describe('session middleware', () => {
  afterEach(() => {
    clearCsrfToken();
  });

  it('attaches x-csrf-token on mutating requests from memory', async () => {
    setCsrfToken('csrf-memory');
    const seen: Array<string | null> = [];
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      seen.push(new Request(input, init).headers.get('x-csrf-token'));
      return new Response(null, { status: 204 });
    });
    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await client.POST('/api/v1/auth/logout', {
      params: { header: { 'x-csrf-token': '' } },
    });
    expect(() => parseEmptyResult(result)).not.toThrow();
    expect(seen).toEqual(['csrf-memory']);
  });

  it('does not attach x-csrf-token on GET', async () => {
    setCsrfToken('csrf-memory');
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(new Request(input, init).headers.get('x-csrf-token')).toBeNull();
      return Response.json({ status: 'ok' });
    });
    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetch: fetchMock as unknown as typeof fetch,
    });
    await client.GET('/health');
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('notifies 401 handlers and clears CSRF for authenticated routes', async () => {
    setCsrfToken('csrf-memory');
    const handler = vi.fn();
    const unregister = onUnauthorized(handler);
    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetch: vi.fn(async () => problem(401, 'AUTH_SESSION_EXPIRED')) as unknown as typeof fetch,
    });

    const result = await client.GET('/api/v1/users');
    unregister();

    expect(handler).toHaveBeenCalledOnce();
    expect(getCsrfToken()).toBeNull();
    expect(() => parseApiResult(result)).toThrow();
  });

  it('does not notify 401 handlers for login failures', async () => {
    const handler = vi.fn();
    const unregister = onUnauthorized(handler);
    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetch: vi.fn(async () => problem(401, 'AUTH_INVALID_CREDENTIALS')) as unknown as typeof fetch,
    });

    await client.POST('/api/v1/auth/login', { body: { email: 'a@b.co', password: 'x' } });
    unregister();

    expect(handler).not.toHaveBeenCalled();
  });

  it('does not notify 401 handlers for session probe /auth/me', async () => {
    setCsrfToken('csrf-memory');
    const handler = vi.fn();
    const unregister = onUnauthorized(handler);
    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetch: vi.fn(async () => problem(401, 'UNAUTHORIZED')) as unknown as typeof fetch,
    });

    const result = await client.GET('/api/v1/auth/me');
    unregister();

    expect(handler).not.toHaveBeenCalled();
    expect(getCsrfToken()).toBe('csrf-memory');
    expect(() => parseApiResult(result)).toThrow();
  });
});

describe('createApiClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('attaches x-request-id and credentials include', async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = new Request(input, init);
      expect(request.headers.get(REQUEST_ID_HEADER)).toBeTruthy();
      expect(request.credentials).toBe('include');
      return Response.json({ status: 'ok' });
    });

    const client = createApiClient({
      baseUrl: 'http://api.test',
      timeoutMs: 5_000,
      withCredentials: true,
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await client.GET('/health');
    expect(parseApiResult(result)).toEqual({ status: 'ok' });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('normalizes Problem Details HTTP errors', async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            type: 'about:blank',
            title: 'Not Found',
            status: 404,
            detail: 'Missing',
            code: 'NOT_FOUND',
            requestId: 'req_mock',
          }),
          {
            status: 404,
            headers: {
              'content-type': 'application/problem+json',
              'x-request-id': 'req_mock',
            },
          },
        ),
    );

    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetch: fetchMock as unknown as typeof fetch,
    });

    const result = await client.GET('/health');
    expect(() => parseApiResult(result)).toThrow();
    try {
      parseApiResult(result);
    } catch (error) {
      expect(isApiError(error)).toBe(true);
      if (isApiError(error)) {
        expect(error.kind).toBe('not_found');
        expect(error.code).toBe('NOT_FOUND');
        expect(error.requestId).toBe('req_mock');
      }
    }
  });

  it('maps network failures through middleware', async () => {
    const fetchMock = vi.fn(async () => {
      throw new TypeError('Failed to fetch');
    });

    const client = createApiClient({
      baseUrl: 'http://api.test',
      fetch: fetchMock as unknown as typeof fetch,
    });

    await expect(client.GET('/health')).rejects.toSatisfy((error: unknown) => {
      expect(isApiError(error)).toBe(true);
      if (isApiError(error)) {
        expect(error.kind).toBe('network');
      }
      return true;
    });
  });

  it('times out slow requests via AbortController', async () => {
    const fetchMock = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () => {
            reject(init.signal?.reason ?? new DOMException('Aborted', 'AbortError'));
          });
        }),
    );

    const client = createApiClient({
      baseUrl: 'http://api.test',
      timeoutMs: 20,
      fetch: fetchMock as unknown as typeof fetch,
    });

    await expect(client.GET('/health')).rejects.toSatisfy((error: unknown) => {
      expect(isApiError(error)).toBe(true);
      if (isApiError(error)) {
        expect(error.kind).toBe('timeout');
      }
      return true;
    });
  });

  it('maps AbortError from fetch to cancelled ApiError', async () => {
    const fetchMock = vi.fn(async () => {
      throw new DOMException('Aborted', 'AbortError');
    });

    const client = createApiClient({
      baseUrl: 'http://api.test',
      timeoutMs: 5_000,
      fetch: fetchMock as unknown as typeof fetch,
    });

    await expect(client.GET('/health')).rejects.toSatisfy((error: unknown) => {
      expect(isApiError(error)).toBe(true);
      if (isApiError(error)) {
        expect(error.kind).toBe('cancelled');
      }
      return true;
    });
  });
});
