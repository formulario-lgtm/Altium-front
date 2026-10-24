import {
  ApiError,
  type ApiErrorKind,
  type FieldViolation,
  type ProblemDetailsPayload,
} from './types';

const KIND_BY_STATUS: Record<number, ApiErrorKind> = {
  400: 'bad_request',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not_found',
  409: 'conflict',
  429: 'rate_limited',
};

const SAFE_MESSAGE_BY_KIND: Record<ApiErrorKind, string> = {
  validation: 'Please review the highlighted fields.',
  bad_request: 'The request could not be processed.',
  unauthorized: 'You need to sign in to continue.',
  forbidden: 'You do not have permission to perform this action.',
  not_found: 'The requested resource was not found.',
  conflict: 'This action conflicts with the current state.',
  rate_limited: 'Too many requests. Please wait and try again.',
  server: 'Something went wrong on the server. Please try again later.',
  network: 'Unable to reach the API. Check your connection or API URL.',
  timeout: 'The request timed out. Please try again.',
  cancelled: 'The request was cancelled.',
  unknown: 'An unexpected error occurred.',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}

export function isProblemDetails(value: unknown): value is ProblemDetailsPayload {
  return (
    isRecord(value) && typeof value['status'] === 'number' && typeof value['title'] === 'string'
  );
}

function mapStatusToKind(status?: number, code?: string): ApiErrorKind {
  if (code === 'VALIDATION_ERROR' || status === 422) {
    return 'validation';
  }
  if (status !== undefined && KIND_BY_STATUS[status]) {
    return KIND_BY_STATUS[status] ?? 'unknown';
  }
  if (status !== undefined && status >= 500) {
    return 'server';
  }
  return 'unknown';
}

function extractFieldErrors(payload: ProblemDetailsPayload | undefined): FieldViolation[] {
  if (!payload?.errors || !Array.isArray(payload.errors)) {
    return [];
  }

  return payload.errors.flatMap((item) => {
    if (
      typeof item?.field === 'string' &&
      typeof item.code === 'string' &&
      typeof item.message === 'string'
    ) {
      return [{ field: item.field, code: item.code, message: item.message }];
    }
    return [];
  });
}

function readHeader(headers: Headers | undefined, name: string): string | undefined {
  if (!headers) {
    return undefined;
  }
  const value = headers.get(name);
  return value && value.length > 0 ? value : undefined;
}

function errorName(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.name;
  }
  if (isRecord(error) && typeof error['name'] === 'string') {
    return error['name'];
  }
  return undefined;
}

export function isTimeoutError(error: unknown): boolean {
  const name = errorName(error);
  if (name === 'TimeoutError') {
    return true;
  }
  if (error instanceof Error && /timed out/i.test(error.message)) {
    return true;
  }
  return false;
}

export function isAbortError(error: unknown): boolean {
  return errorName(error) === 'AbortError';
}

function fromProblem(status: number, data: unknown, headers?: Headers): ApiError {
  const problem = isProblemDetails(data) ? data : undefined;
  const kind = mapStatusToKind(status, problem?.code);
  const fieldErrors = extractFieldErrors(problem);
  const effectiveKind = fieldErrors.length > 0 ? 'validation' : kind;

  return new ApiError({
    kind: effectiveKind,
    code: problem?.code ?? `HTTP_${status}`,
    message: SAFE_MESSAGE_BY_KIND[effectiveKind],
    status,
    requestId: problem?.requestId ?? readHeader(headers, 'x-request-id'),
    title: problem?.title,
    detail:
      typeof problem?.detail === 'string'
        ? problem.detail
        : typeof problem?.title === 'string'
          ? problem.title
          : undefined,
    instance: problem?.instance,
    fieldErrors,
    problem: problem ?? data,
  });
}

/** Map fetch / openapi-fetch failures (network, abort, timeout). */
export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  if (isTimeoutError(error)) {
    return new ApiError({
      kind: 'timeout',
      code: 'TIMEOUT',
      message: SAFE_MESSAGE_BY_KIND.timeout,
    });
  }

  if (isAbortError(error)) {
    return new ApiError({
      kind: 'cancelled',
      code: 'CANCELLED',
      message: SAFE_MESSAGE_BY_KIND.cancelled,
    });
  }

  return new ApiError({
    kind: 'network',
    code: 'NETWORK_ERROR',
    message: SAFE_MESSAGE_BY_KIND.network,
  });
}

/** Map HTTP error responses (4xx/5xx) including Problem Details bodies. */
export function toApiErrorFromResponse(response: Response, body: unknown): ApiError {
  return fromProblem(response.status, body, response.headers);
}

/** Map field violations for future form libraries (VeeValidate, etc.). */
export function fieldErrorsToMap(error: ApiError): Record<string, string> {
  const map: Record<string, string> = {};
  for (const item of error.fieldErrors) {
    if (!map[item.field]) {
      map[item.field] = item.message;
    }
  }
  return map;
}
