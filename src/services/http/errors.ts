import type { AxiosError } from 'axios';
import type { ApiError, ApiErrorCode } from './types';

function mapStatusToCode(status?: number): ApiErrorCode {
  if (status === 401) return 'unauthorized';
  if (status === 403) return 'forbidden';
  if (status === 404) return 'not_found';
  if (status === 422 || status === 400) return 'validation';
  if (status !== undefined && status >= 500) return 'server';
  return 'unknown';
}

export function toApiError(error: unknown): ApiError {
  if (isApiError(error)) {
    return error;
  }

  const axiosError = error as AxiosError<{ message?: string | string[] }>;

  if (axiosError.code === 'ECONNABORTED') {
    return {
      code: 'timeout',
      message: 'The request timed out. Please try again.',
    };
  }

  if (!axiosError.response) {
    return {
      code: 'network',
      message: 'Unable to reach the API. Check your connection or API URL.',
    };
  }

  const status = axiosError.response.status;
  const payloadMessage = axiosError.response.data?.message;
  const message = Array.isArray(payloadMessage)
    ? payloadMessage.join(', ')
    : typeof payloadMessage === 'string'
      ? payloadMessage
      : axiosError.message || 'Unexpected API error';

  return {
    code: mapStatusToCode(status),
    message,
    status,
    details: axiosError.response.data,
  };
}

export function isApiError(value: unknown): value is ApiError {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    typeof (value as ApiError).code === 'string' &&
    typeof (value as ApiError).message === 'string'
  );
}
