import { useQuery } from '@tanstack/vue-query';
import { computed } from 'vue';
import { appEnv } from '@/config/env';
import { fetchHealth, isApiError } from '@/services/http';
import { queryKeys } from '@/services/http/query-keys';

export function useApiHealthQuery() {
  const enabled = computed(() => appEnv.enableHealthCheck);

  const query = useQuery({
    queryKey: queryKeys.system.health(),
    queryFn: ({ signal }) => fetchHealth({ signal }),
    enabled,
    retry: false,
  });

  const errorMessage = computed(() => {
    if (!query.error.value) {
      return null;
    }

    return isApiError(query.error.value)
      ? query.error.value.message
      : 'Unexpected health check error';
  });

  return {
    enabled,
    query,
    errorMessage,
  };
}
