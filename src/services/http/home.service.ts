import type {
  AdminHome,
  AdministrativeHome,
  HomePeriodQuery,
  HomePeriodTeamQuery,
  SellerHome,
  SupervisorHome,
} from './api-types';
import { apiClient, parseApiResult } from './client';

type RequestOptions = { signal?: AbortSignal };

export async function getSellerHome(
  query: HomePeriodQuery = {},
  options?: RequestOptions,
): Promise<SellerHome> {
  const result = await apiClient.GET('/api/v1/home/seller', {
    params: { query },
    signal: options?.signal,
  });
  return parseApiResult(result);
}

export async function getAdministrativeHome(
  query: HomePeriodQuery = {},
  options?: RequestOptions,
): Promise<AdministrativeHome> {
  const result = await apiClient.GET('/api/v1/home/administrative', {
    params: { query },
    signal: options?.signal,
  });
  return parseApiResult(result);
}

export async function getSupervisorHome(
  query: HomePeriodTeamQuery = {},
  options?: RequestOptions,
): Promise<SupervisorHome> {
  const result = await apiClient.GET('/api/v1/home/supervisor', {
    params: { query },
    signal: options?.signal,
  });
  return parseApiResult(result);
}

export async function getAdminHome(
  query: HomePeriodTeamQuery = {},
  options?: RequestOptions,
): Promise<AdminHome> {
  const result = await apiClient.GET('/api/v1/home/admin', {
    params: { query },
    signal: options?.signal,
  });
  return parseApiResult(result);
}
