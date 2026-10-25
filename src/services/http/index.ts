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
  beginGlobalLoading,
  endGlobalLoading,
  isSilentLoadingUrl,
  resetGlobalLoading,
  useGlobalLoadingState,
} from './loading';
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
  startSaleReview,
  setSaleAssignee,
  listSaleObservations,
  createSaleObservation,
  resolveSaleObservation,
  listSaleFollowUps,
  createSaleFollowUp,
  getSaleHistory,
  getSaleDocuments,
  uploadSaleDocument,
  deleteSaleDocument,
  downloadSaleDocument,
  exportSaleExcel,
} from './sales.service';
export type { UploadSaleDocumentInput } from './sales.service';
export { getAdministrativeDashboard } from './administrative.service';
export {
  listTeams,
  getTeam,
  createTeam,
  updateTeam,
  listTeamMembers,
  addTeamMember,
  removeTeamMember,
} from './teams.service';
export {
  getSupervisionDashboard,
  listSupervisionSellers,
  getSupervisionSeller,
  compareSupervisionSellers,
  listSupervisionAdministratives,
  getSupervisionAdministrative,
  listSupervisionGoals,
  createSupervisionGoal,
  patchSupervisionGoal,
  getSupervisionGoalHistory,
} from './supervision.service';
export {
  getSellerHome,
  getAdministrativeHome,
  getSupervisorHome,
  getAdminHome,
} from './home.service';
export {
  listNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
} from './notifications.service';
export { createTimedFetch } from './timed-fetch';
export { ApiError } from './types';
export type { ApiErrorKind, FieldViolation, ProblemDetailsPayload } from './types';
export type * from './api-types';
