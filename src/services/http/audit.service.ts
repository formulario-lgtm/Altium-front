import type { AuditLogList, AuditLogQuery } from './api-types';
import { apiClient, parseApiResult } from './client';

export async function listAuditLogs(
  query: AuditLogQuery,
  options?: { signal?: AbortSignal },
): Promise<AuditLogList> {
  const result = await apiClient.GET('/api/v1/audit-logs', {
    params: { query },
    signal: options?.signal,
  });
  return parseApiResult(result);
}
