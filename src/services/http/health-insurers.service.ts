import type { HealthInsurerList, HealthPlanList } from './api-types';
import { apiClient, backgroundApiClient, parseApiResult } from './client';

type RequestOptions = { signal?: AbortSignal };

export async function listHealthInsurers(options?: RequestOptions): Promise<HealthInsurerList> {
  const result = await apiClient.GET('/api/v1/health-insurers', {
    signal: options?.signal,
  });
  return parseApiResult(result);
}

export async function listHealthPlans(
  insurerId: string,
  options?: RequestOptions,
): Promise<HealthPlanList> {
  const result = await backgroundApiClient.GET('/api/v1/health-insurers/{id}/plans', {
    params: { path: { id: insurerId } },
    signal: options?.signal,
  });
  return parseApiResult(result);
}
