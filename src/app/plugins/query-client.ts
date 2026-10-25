import { QueryClient, type VueQueryPluginOptions } from '@tanstack/vue-query';
import { isApiError } from '@/services/http';

/**
 * Shared QueryClient defaults.
 * - Remote data lives here, not in Pinia.
 * - Do not retry auth failures.
 */
export function createAppQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        gcTime: 5 * 60_000,
        retry: (failureCount, error) => {
          if (isApiError(error) && (error.status === 401 || error.status === 403)) {
            return false;
          }
          return failureCount < 1;
        },
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

/** Shared instance so session handlers can clear cached remote data on logout/401. */
export const appQueryClient = createAppQueryClient();

export const vueQueryPluginOptions: VueQueryPluginOptions = {
  queryClient: appQueryClient,
};
