import type {
  ActivateAccountBody,
  AuthSessionResponse,
  ChangePasswordBody,
  ForgotPasswordBody,
  LoginBody,
  MessageResponse,
  ResetPasswordBody,
  SessionList,
} from './api-types';
import { apiClient, parseApiResult, parseEmptyResult } from './client';
import { clearCsrfToken, csrfHeaders, setCsrfToken } from './csrf';

type RequestOptions = { signal?: AbortSignal };

function rememberCsrf(response: AuthSessionResponse): AuthSessionResponse {
  setCsrfToken(response.csrfToken);
  return response;
}

export async function login(body: LoginBody): Promise<AuthSessionResponse> {
  const result = await apiClient.POST('/api/v1/auth/login', { body });
  return rememberCsrf(parseApiResult(result));
}

export async function fetchMe(options?: RequestOptions): Promise<AuthSessionResponse> {
  const result = await apiClient.GET('/api/v1/auth/me', { signal: options?.signal });
  // The store applies the token only after checking that this probe is still current.
  return parseApiResult(result);
}

export async function logout(): Promise<void> {
  const result = await apiClient.POST('/api/v1/auth/logout', {
    params: { header: csrfHeaders() },
  });
  parseEmptyResult(result);
  clearCsrfToken();
}

export async function logoutAll(): Promise<void> {
  const result = await apiClient.POST('/api/v1/auth/logout-all', {
    params: { header: csrfHeaders() },
  });
  parseEmptyResult(result);
  clearCsrfToken();
}

export async function changePassword(body: ChangePasswordBody): Promise<AuthSessionResponse> {
  const result = await apiClient.POST('/api/v1/auth/change-password', {
    params: { header: csrfHeaders() },
    body,
  });
  return rememberCsrf(parseApiResult(result));
}

export async function forgotPassword(body: ForgotPasswordBody): Promise<MessageResponse> {
  const result = await apiClient.POST('/api/v1/auth/forgot-password', { body });
  return parseApiResult(result);
}

export async function resetPassword(body: ResetPasswordBody): Promise<void> {
  const result = await apiClient.POST('/api/v1/auth/reset-password', { body });
  parseEmptyResult(result);
}

export async function activateAccount(body: ActivateAccountBody): Promise<void> {
  const result = await apiClient.POST('/api/v1/auth/activate', { body });
  parseEmptyResult(result);
}

export async function listSessions(options?: RequestOptions): Promise<SessionList> {
  const result = await apiClient.GET('/api/v1/auth/sessions', { signal: options?.signal });
  return parseApiResult(result);
}

export async function revokeSession(id: string): Promise<void> {
  const result = await apiClient.DELETE('/api/v1/auth/sessions/{id}', {
    params: { path: { id }, header: csrfHeaders() },
  });
  parseEmptyResult(result);
}
