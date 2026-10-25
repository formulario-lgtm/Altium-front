import type {
  CreateUserBody,
  SettableUserStatus,
  UpdateUserBody,
  User,
  UserList,
  UserListQuery,
} from './api-types';
import { apiClient, parseApiResult, parseEmptyResult } from './client';
import { csrfHeaders } from './csrf';

type RequestOptions = { signal?: AbortSignal };

export async function listUsers(query: UserListQuery, options?: RequestOptions): Promise<UserList> {
  const result = await apiClient.GET('/api/v1/users', {
    params: { query },
    signal: options?.signal,
  });
  return parseApiResult(result);
}

export async function getUser(id: string, options?: RequestOptions): Promise<User> {
  const result = await apiClient.GET('/api/v1/users/{id}', {
    params: { path: { id } },
    signal: options?.signal,
  });
  return parseApiResult(result);
}

export async function createUser(body: CreateUserBody): Promise<User> {
  const result = await apiClient.POST('/api/v1/users', {
    params: { header: csrfHeaders() },
    body,
  });
  return parseApiResult(result);
}

export async function updateUser(id: string, body: UpdateUserBody): Promise<User> {
  const result = await apiClient.PATCH('/api/v1/users/{id}', {
    params: { path: { id }, header: csrfHeaders() },
    body,
  });
  return parseApiResult(result);
}

export async function updateUserStatus(id: string, status: SettableUserStatus): Promise<User> {
  const result = await apiClient.PATCH('/api/v1/users/{id}/status', {
    params: { path: { id }, header: csrfHeaders() },
    body: { status },
  });
  return parseApiResult(result);
}

export async function requestUserPasswordReset(id: string): Promise<void> {
  const result = await apiClient.POST('/api/v1/users/{id}/reset-password', {
    params: { path: { id }, header: csrfHeaders() },
  });
  parseEmptyResult(result);
}
