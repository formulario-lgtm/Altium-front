import { httpClient } from './client';
import type { HealthResponse } from './types';

export async function fetchHealth(): Promise<HealthResponse> {
  const { data } = await httpClient.get<HealthResponse>('/health');
  return data;
}
