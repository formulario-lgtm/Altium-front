export {
  apiClient,
  createApiClient,
  onUnauthorized,
  parseApiResult,
  parseEmptyResult,
  REQUEST_ID_HEADER,
} from './client';
export type { UnauthorizedHandler } from './client';
export {
  clearCsrfToken,
  csrfHeaders,
  CSRF_COOKIE,
  CSRF_HEADER,
  getCsrfToken,
  readCsrfCookie,
  setCsrfToken,
} from './csrf';
export {
  apiErrorMessage,
  toApiError,
  toApiErrorFromResponse,
  isApiError,
  isProblemDetails,
  isAbortError,
  isTimeoutError,
  fieldErrorsToMap,
} from './errors';
export { fetchHealth } from './health.service';
export { listHealthInsurers, listHealthPlans } from './health-insurers.service';
export {
  listSales,
  getSale,
  createSale,
  updateSale,
  submitSale,
  returnSale,
  getSaleHistory,
  getSaleDocuments,
  exportSaleExcel,
} from './sales.service';
export { createTimedFetch } from './timed-fetch';
export { ApiError } from './types';
export type { ApiErrorKind, FieldViolation, ProblemDetailsPayload } from './types';
export type * from './api-types';
