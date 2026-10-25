import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import {
  compareSupervisionSellers,
  createSupervisionGoal,
  getSupervisionAdministrative,
  getSupervisionDashboard,
  getSupervisionGoalHistory,
  getSupervisionSeller,
  listSupervisionAdministratives,
  listSupervisionGoals,
  listSupervisionSellers,
  listTeams,
  patchSupervisionGoal,
  type CreateMonthlyGoalBody,
  type PatchMonthlyGoalBody,
  type SupervisionAdministrativeListQuery,
  type SupervisionGoalsQuery,
  type SupervisionPeriodQuery,
  type SupervisionSellerListQuery,
} from '@/services/http';
import { queryKeys } from '@/services/http/query-keys';

export function useSupervisionDashboardQuery(query: MaybeRefOrGetter<SupervisionPeriodQuery>) {
  return useQuery({
    queryKey: computed(() => queryKeys.supervision.dashboard(toValue(query))),
    queryFn: ({ signal }) => getSupervisionDashboard(toValue(query), { signal }),
    placeholderData: keepPreviousData,
  });
}

export function useSupervisionSellersQuery(query: MaybeRefOrGetter<SupervisionSellerListQuery>) {
  return useQuery({
    queryKey: computed(() => queryKeys.supervision.sellers(toValue(query))),
    queryFn: ({ signal }) => listSupervisionSellers(toValue(query), { signal }),
    placeholderData: keepPreviousData,
  });
}

export function useSupervisionSellerQuery(
  id: MaybeRefOrGetter<string>,
  query: MaybeRefOrGetter<SupervisionPeriodQuery>,
) {
  return useQuery({
    queryKey: computed(() => queryKeys.supervision.seller(toValue(id), toValue(query))),
    queryFn: ({ signal }) => getSupervisionSeller(toValue(id), toValue(query), { signal }),
    enabled: computed(() => Boolean(toValue(id))),
    placeholderData: keepPreviousData,
  });
}

export function useSupervisionSellersComparisonQuery(
  query: MaybeRefOrGetter<SupervisionPeriodQuery & { sellerIds: string[] }>,
) {
  return useQuery({
    queryKey: computed(() => queryKeys.supervision.comparison(toValue(query))),
    queryFn: ({ signal }) => compareSupervisionSellers(toValue(query), { signal }),
    enabled: computed(() => toValue(query).sellerIds.length > 0),
    placeholderData: keepPreviousData,
  });
}

export function useSupervisionAdministrativesQuery(
  query: MaybeRefOrGetter<SupervisionAdministrativeListQuery>,
) {
  return useQuery({
    queryKey: computed(() => queryKeys.supervision.administratives(toValue(query))),
    queryFn: ({ signal }) => listSupervisionAdministratives(toValue(query), { signal }),
    placeholderData: keepPreviousData,
  });
}

export function useSupervisionAdministrativeQuery(
  id: MaybeRefOrGetter<string>,
  query: MaybeRefOrGetter<SupervisionPeriodQuery>,
) {
  return useQuery({
    queryKey: computed(() => queryKeys.supervision.administrative(toValue(id), toValue(query))),
    queryFn: ({ signal }) => getSupervisionAdministrative(toValue(id), toValue(query), { signal }),
    enabled: computed(() => Boolean(toValue(id))),
    placeholderData: keepPreviousData,
  });
}

export function useSupervisionGoalsQuery(query: MaybeRefOrGetter<SupervisionGoalsQuery>) {
  return useQuery({
    queryKey: computed(() => queryKeys.supervision.goals(toValue(query))),
    queryFn: ({ signal }) => listSupervisionGoals(toValue(query), { signal }),
    placeholderData: keepPreviousData,
  });
}

export function useSupervisionGoalHistoryQuery(id: MaybeRefOrGetter<string | null>) {
  return useQuery({
    queryKey: computed(() => queryKeys.supervision.goalHistory(toValue(id) ?? '')),
    queryFn: ({ signal }) => getSupervisionGoalHistory(toValue(id)!, { signal }),
    enabled: computed(() => Boolean(toValue(id))),
  });
}

export function useSupervisionTeamsQuery(enabled: MaybeRefOrGetter<boolean> = true) {
  const query = { limit: 100, offset: 0 } as const;
  return useQuery({
    queryKey: queryKeys.teams.list(query),
    queryFn: ({ signal }) => listTeams(query, { signal }),
    enabled: computed(() => toValue(enabled)),
  });
}

export function useCreateSupervisionGoalMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateMonthlyGoalBody) => createSupervisionGoal(body),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.supervision.all });
    },
  });
}

export function usePatchSupervisionGoalMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PatchMonthlyGoalBody }) =>
      patchSupervisionGoal(id, body),
    onSuccess: async (_goal, vars) => {
      await client.invalidateQueries({ queryKey: queryKeys.supervision.all });
      await client.invalidateQueries({ queryKey: queryKeys.supervision.goalHistory(vars.id) });
    },
  });
}
