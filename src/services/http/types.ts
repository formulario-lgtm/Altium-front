export type ApiErrorCode =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'network'
  | 'timeout'
  | 'server'
  | 'unknown';

export type ApiError = {
  code: ApiErrorCode;
  message: string;
  status?: number;
  details?: unknown;
};

export type HealthResponse = {
  status: string;
};
