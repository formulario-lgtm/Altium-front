import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import {
  createSaleFollowUp,
  createSaleObservation,
  getAdministrativeDashboard,
  resolveSaleObservation,
  setSaleAssignee,
  startSaleReview,
  listSaleFollowUps,
  listSaleObservations,
  type CreateSaleFollowUpBody,
  type CreateSaleObservationBody,
  type PatchSaleAssigneeBody,
} from '@/services/http';
import { queryKeys } from '@/services/http/query-keys';

async function invalidateSaleWorkspace(
  client: ReturnType<typeof useQueryClient>,
  saleId: string,
): Promise<void> {
  await client.invalidateQueries({ queryKey: queryKeys.sales.all });
  await client.invalidateQueries({ queryKey: queryKeys.sales.detail(saleId) });
  await client.invalidateQueries({ queryKey: queryKeys.sales.history(saleId) });
  await client.invalidateQueries({ queryKey: queryKeys.sales.observations(saleId) });
  await client.invalidateQueries({ queryKey: queryKeys.sales.followUps(saleId) });
  await client.invalidateQueries({ queryKey: queryKeys.administrative.all });
  await client.invalidateQueries({ queryKey: queryKeys.notifications.all });
}

export function useAdministrativeDashboardQuery(enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: queryKeys.administrative.dashboard(),
    queryFn: ({ signal }) => getAdministrativeDashboard({ signal }),
    enabled: computed(() => toValue(enabled)),
  });
}

export function useSaleObservationsQuery(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => queryKeys.sales.observations(toValue(id))),
    queryFn: ({ signal }) => listSaleObservations(toValue(id), { signal }),
    enabled: computed(() => Boolean(toValue(id))),
    placeholderData: keepPreviousData,
  });
}

export function useSaleFollowUpsQuery(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => queryKeys.sales.followUps(toValue(id))),
    queryFn: ({ signal }) => listSaleFollowUps(toValue(id), { signal }),
    enabled: computed(() => Boolean(toValue(id))),
    placeholderData: keepPreviousData,
  });
}

export function useStartSaleReviewMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => startSaleReview(id),
    onSuccess: async (sale) => {
      client.setQueryData(queryKeys.sales.detail(sale.id), sale);
      await invalidateSaleWorkspace(client, sale.id);
    },
  });
}

export function useSetSaleAssigneeMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: PatchSaleAssigneeBody }) =>
      setSaleAssignee(id, body),
    onSuccess: async (sale) => {
      client.setQueryData(queryKeys.sales.detail(sale.id), sale);
      await invalidateSaleWorkspace(client, sale.id);
    },
  });
}

export function useCreateSaleObservationMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CreateSaleObservationBody }) =>
      createSaleObservation(id, body),
    onSuccess: async (_obs, vars) => {
      await client.invalidateQueries({ queryKey: queryKeys.sales.observations(vars.id) });
      await client.invalidateQueries({ queryKey: queryKeys.administrative.all });
    },
  });
}

export function useResolveSaleObservationMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, observationId }: { id: string; observationId: string }) =>
      resolveSaleObservation(id, observationId),
    onSuccess: async (_obs, vars) => {
      await client.invalidateQueries({ queryKey: queryKeys.sales.observations(vars.id) });
      await client.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useCreateSaleFollowUpMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: CreateSaleFollowUpBody }) =>
      createSaleFollowUp(id, body),
    onSuccess: async (_row, vars) => {
      await client.invalidateQueries({ queryKey: queryKeys.sales.followUps(vars.id) });
      await client.invalidateQueries({ queryKey: queryKeys.administrative.all });
    },
  });
}
