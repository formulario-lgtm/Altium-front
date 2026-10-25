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
  validation: 'Revisa los campos marcados.',
  bad_request: 'No se pudo procesar la solicitud.',
  unauthorized: 'Debes iniciar sesión para continuar.',
  forbidden: 'No tienes permiso para realizar esta acción.',
  not_found: 'No se encontró el recurso solicitado.',
  conflict: 'La acción entra en conflicto con el estado actual.',
  rate_limited: 'Demasiadas solicitudes. Espera un momento e inténtalo de nuevo.',
  server: 'Ocurrió un error en el servidor. Inténtalo más tarde.',
  network: 'No se pudo conectar con la API. Revisa tu conexión o la URL de la API.',
  timeout: 'La solicitud tardó demasiado. Inténtalo de nuevo.',
  cancelled: 'La solicitud fue cancelada.',
  unknown: 'Ocurrió un error inesperado.',
};

/** User-facing copy for backend error codes documented in Altium-back (auth guide). */
const SAFE_MESSAGE_BY_CODE: Record<string, string> = {
  AUTH_INVALID_CREDENTIALS: 'Correo o contraseña incorrectos.',
  AUTH_ACCOUNT_PENDING: 'La cuenta aún no fue activada. Revisa el enlace de activación.',
  AUTH_ACCOUNT_SUSPENDED: 'La cuenta está suspendida. Contacta a un administrador.',
  AUTH_ACCOUNT_DISABLED: 'La cuenta está deshabilitada. Contacta a un administrador.',
  AUTH_SESSION_EXPIRED: 'Tu sesión expiró. Inicia sesión nuevamente.',
  AUTH_SESSION_REVOKED: 'Tu sesión fue cerrada. Inicia sesión nuevamente.',
  AUTH_CSRF_INVALID: 'La sesión no pudo validarse. Recarga la página e inténtalo de nuevo.',
  AUTH_PASSWORD_CHANGE_REQUIRED: 'Debes cambiar tu contraseña antes de continuar.',
  AUTH_TOKEN_INVALID: 'El enlace no es válido o expiró. Solicita uno nuevo.',
  AUTH_RATE_LIMITED: 'Demasiados intentos. Espera un minuto e inténtalo de nuevo.',
};

/** Safe, user-facing message for any thrown value (prefers known backend codes). */
export function apiErrorMessage(error: unknown, fallback = SAFE_MESSAGE_BY_KIND.unknown): string {
  if (!isApiError(error)) {
    return fallback;
  }
  const known = SAFE_MESSAGE_BY_CODE[error.code];
  if (known) {
    return known;
  }
  // 409 details explain business rules (e.g. last SUPER_ADMIN) and never contain secrets.
  if (error.kind === 'conflict' && error.detail && error.detail !== error.title) {
    return `${error.message} ${error.detail}`;
  }
  return error.message;
}

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
