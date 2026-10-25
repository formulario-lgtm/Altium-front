import type { PermissionList, Role, RoleList } from './api-types';
import { apiClient, parseApiResult } from './client';
import { csrfHeaders } from './csrf';

type RequestOptions = { signal?: AbortSignal };

export async function listRoles(options?: RequestOptions): Promise<RoleList> {
  const result = await apiClient.GET('/api/v1/roles', { signal: options?.signal });
  return parseApiResult(result);
}

export async function listPermissions(options?: RequestOptions): Promise<PermissionList> {
  const result = await apiClient.GET('/api/v1/permissions', { signal: options?.signal });
  return parseApiResult(result);
}

export async function replaceRolePermissions(id: string, permissionCodes: string[]): Promise<Role> {
  const result = await apiClient.PUT('/api/v1/roles/{id}/permissions', {
    params: { path: { id }, header: csrfHeaders() },
    body: { permissionCodes },
  });
  return parseApiResult(result);
}
