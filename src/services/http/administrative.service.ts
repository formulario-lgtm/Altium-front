import type { AdministrativeDashboard } from './api-types';
import { apiClient, parseApiResult } from './client';

type RequestOptions = { signal?: AbortSignal };

export async function getAdministrativeDashboard(
  options?: RequestOptions,
): Promise<AdministrativeDashboard> {
  const result = await apiClient.GET('/api/v1/administrative/dashboard', {
    signal: options?.signal,
  });
  return parseApiResult(result);
}
