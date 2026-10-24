import type { paths } from '@/types/generated/api';
import { apiClient, parseApiResult } from './client';

type HealthOk = paths['/health']['get']['responses']['200']['content']['application/json'];

export async function fetchHealth(options?: { signal?: AbortSignal }): Promise<HealthOk> {
  const result = await apiClient.GET('/health', {
    signal: options?.signal,
  });
  return parseApiResult(result);
}
