import createClient, { type Client, type Middleware } from 'openapi-fetch';
import { apiConfig } from '@/config/api';
import type { paths } from '@/types/generated/api';
import { toApiError, toApiErrorFromResponse } from './errors';
import { createTimedFetch } from './timed-fetch';

export const REQUEST_ID_HEADER = 'x-request-id';

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

      // Future cookie auth: attach CSRF header here when the backend issues a CSRF cookie.
      // Example: request.headers.set('x-csrf-token', readCsrfCookie());

      return request;
    },
    async onError({ error }) {
      return toApiError(error);
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

  client.use(createTracingMiddleware());
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
