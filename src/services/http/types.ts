export type ApiErrorKind =
  | 'validation'
  | 'bad_request'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'conflict'
  | 'rate_limited'
  | 'server'
  | 'network'
  | 'timeout'
  | 'cancelled'
  | 'unknown';

export type FieldViolation = {
  field: string;
  code: string;
  message: string;
};

export type ProblemDetailsPayload = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  code?: string;
  requestId?: string;
  errors?: Array<{
    field?: string;
    code?: string;
    message?: string;
  }>;
};

export type ApiErrorInit = {
  kind: ApiErrorKind;
  code: string;
  message: string;
  status?: number;
  requestId?: string;
  title?: string;
  detail?: string;
  instance?: string;
  fieldErrors?: FieldViolation[];
  problem?: unknown;
};

/** Normalized API failure used across openapi-fetch + TanStack Query. */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  readonly code: string;
  readonly status?: number;
  readonly requestId?: string;
  readonly title?: string;
  readonly detail?: string;
  readonly instance?: string;
  readonly fieldErrors: FieldViolation[];
  readonly problem?: unknown;

  constructor(init: ApiErrorInit) {
    super(init.message);
    this.name = 'ApiError';
    this.kind = init.kind;
    this.code = init.code;
    this.fieldErrors = init.fieldErrors ?? [];
    if (init.status !== undefined) this.status = init.status;
    if (init.requestId !== undefined) this.requestId = init.requestId;
    if (init.title !== undefined) this.title = init.title;
    if (init.detail !== undefined) this.detail = init.detail;
    if (init.instance !== undefined) this.instance = init.instance;
    if (init.problem !== undefined) this.problem = init.problem;
  }
}
