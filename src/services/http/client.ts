import createClient, { type Client, type Middleware } from 'openapi-fetch';
import { apiConfig } from '@/config/api';
import type { paths } from '@/types/generated/api';
import { clearCsrfToken, CSRF_HEADER, getCsrfToken, isMutatingMethod } from './csrf';
import { toApiError, toApiErrorFromResponse } from './errors';
import { createTimedFetch } from './timed-fetch';

export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * 401s that must not run the global session-expiry handler:
 * - Public auth credential failures (login, etc.)
 * - Session probe (`/me`) — owned by `auth.ensureSession()` / `loadSession()` so a cold
 *   visit to `/login` does not clear Query + re-enter navigation mid-boot.
 */
const UNAUTHORIZED_EXEMPT_PATHS = [
  '/api/v1/auth/login',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
  '/api/v1/auth/activate',
  '/api/v1/auth/me',
];

export type UnauthorizedHandler = (context: { url: string }) => void;

const unauthorizedHandlers = new Set<UnauthorizedHandler>();

/** Registers a 401 listener (auth store / router). Returns an unregister function. */
export function onUnauthorized(handler: UnauthorizedHandler): () => void {
  unauthorizedHandlers.add(handler);
  return () => {
    unauthorizedHandlers.delete(handler);
  };
}

function isUnauthorizedExempt(url: string): boolean {
  try {
    const { pathname } = new URL(url);
    return UNAUTHORIZED_EXEMPT_PATHS.some((path) => pathname.endsWith(path));
  } catch {
    return false;
  }
}

function notifyUnauthorized(url: string): void {
  clearCsrfToken();
  for (const handler of unauthorizedHandlers) {
    handler({ url });
  }
}

export type CreateApiClientOptions = {
  baseUrl?: string;
  timeoutMs?: number;
  /** When true, sends cookies (`credentials: 'include'`) for future HttpOnly session auth. */
  withCredentials?: boolean;
  /** Injectable fetch (tests). Timeouts still apply unless overridden. */
  fetch?: typeof fetch;
};

function createRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `req_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
  }
  return `req_${Date.now().toString(36)}`;
}

function createTracingMiddleware(): Middleware {
  return {
    async onRequest({ request }) {
      if (!request.headers.has(REQUEST_ID_HEADER)) {
        request.headers.set(REQUEST_ID_HEADER, createRequestId());
      }
      return request;
    },
    async onError({ error }) {
      return toApiError(error);
    },
  };
}

function createSessionMiddleware(): Middleware {
  return {
    async onRequest({ request }) {
      if (!isMutatingMethod(request.method)) {
        return request;
      }

      const token = getCsrfToken();
      if (token) {
        request.headers.set(CSRF_HEADER, token);
      } else if (!request.headers.get(CSRF_HEADER)) {
        request.headers.delete(CSRF_HEADER);
      }
      return request;
    },
    async onResponse({ request, response }) {
      if (response.status === 401 && !isUnauthorizedExempt(request.url)) {
        notifyUnauthorized(request.url);
      }
      return response;
    },
  };
}

export function createApiClient(options: CreateApiClientOptions = {}): Client<paths> {
  const baseUrl = options.baseUrl ?? apiConfig.baseURL;
  const timeoutMs = options.timeoutMs ?? apiConfig.timeoutMs;
  const withCredentials = options.withCredentials ?? apiConfig.withCredentials;
  const baseFetch = options.fetch ?? globalThis.fetch.bind(globalThis);

  const client = createClient<paths>({
    baseUrl,
    credentials: withCredentials ? 'include' : 'same-origin',
    headers: {
      Accept: 'application/json',
    },
    fetch: createTimedFetch(timeoutMs, baseFetch),
  });

  client.use(createTracingMiddleware(), createSessionMiddleware());
  return client;
}

export const apiClient = createApiClient();

/**
 * Converts openapi-fetch `{ data, error, response }` into data or a thrown ApiError.
 * HTTP 4xx/5xx do not throw from fetch; this enforces a single error path for Query.
 */
export function parseApiResult<TData>(result: {
  data?: TData;
  error?: unknown;
  response: Response;
}): TData {
  if (result.response.ok && result.data !== undefined) {
    return result.data;
  }

  throw toApiErrorFromResponse(result.response, result.error);
}

/** Same as `parseApiResult` for `204 No Content` operations. */
export function parseEmptyResult(result: { error?: unknown; response: Response }): void {
  if (result.response.ok) {
    return;
  }

  throw toApiErrorFromResponse(result.response, result.error);
}
