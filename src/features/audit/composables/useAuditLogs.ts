import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import type { AuditLogQuery } from '@/services/http';
import { listAuditLogs } from '@/services/http/audit.service';
import { queryKeys } from '@/services/http/query-keys';

export function useAuditLogsQuery(query: MaybeRefOrGetter<AuditLogQuery>) {
  return useQuery({
    queryKey: computed(() => queryKeys.audit.list(toValue(query))),
    queryFn: ({ signal }) => listAuditLogs(toValue(query), { signal }),
    placeholderData: keepPreviousData,
  });
}
