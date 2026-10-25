import { keepPreviousData, useQuery } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import {
  getAdminHome,
  getAdministrativeHome,
  getSellerHome,
  getSupervisorHome,
  type HomePeriodQuery,
  type HomePeriodTeamQuery,
} from '@/services/http';
import { queryKeys } from '@/services/http/query-keys';
import { useAuthStore } from '@/stores/auth.store';

const STALE_MS = 60_000;

function currentUserId(): string {
  return useAuthStore().user?.id ?? 'anonymous';
}

export function useSellerHomeQuery(query: MaybeRefOrGetter<HomePeriodQuery>) {
  const auth = useAuthStore();
  return useQuery({
    queryKey: computed(() => queryKeys.home.seller(currentUserId(), toValue(query))),
    queryFn: ({ signal }) => getSellerHome(toValue(query), { signal }),
    enabled: computed(() => auth.hasPermission('home.seller.read')),
    staleTime: STALE_MS,
    placeholderData: keepPreviousData,
  });
}

export function useAdministrativeHomeQuery(query: MaybeRefOrGetter<HomePeriodQuery>) {
  const auth = useAuthStore();
  return useQuery({
    queryKey: computed(() => queryKeys.home.administrative(currentUserId(), toValue(query))),
    queryFn: ({ signal }) => getAdministrativeHome(toValue(query), { signal }),
    enabled: computed(() => auth.hasPermission('home.administrative.read')),
    staleTime: STALE_MS,
    placeholderData: keepPreviousData,
  });
}

export function useSupervisorHomeQuery(query: MaybeRefOrGetter<HomePeriodTeamQuery>) {
  const auth = useAuthStore();
  return useQuery({
    queryKey: computed(() => queryKeys.home.supervisor(currentUserId(), toValue(query))),
    queryFn: ({ signal }) => getSupervisorHome(toValue(query), { signal }),
    enabled: computed(() => auth.hasPermission('home.supervisor.read')),
    staleTime: STALE_MS,
    placeholderData: keepPreviousData,
  });
}

export function useAdminHomeQuery(query: MaybeRefOrGetter<HomePeriodTeamQuery>) {
  const auth = useAuthStore();
  return useQuery({
    queryKey: computed(() => queryKeys.home.admin(currentUserId(), toValue(query))),
    queryFn: ({ signal }) => getAdminHome(toValue(query), { signal }),
    enabled: computed(() => auth.hasPermission('home.admin.read')),
    staleTime: STALE_MS,
    placeholderData: keepPreviousData,
  });
}
