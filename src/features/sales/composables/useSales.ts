import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import {
  createSale,
  deleteSaleDocument,
  downloadSaleDocument,
  exportSaleExcel,
  getSale,
  getSaleDocuments,
  getSaleHistory,
  listHealthInsurers,
  listHealthPlans,
  listSales,
  returnSale,
  submitSale,
  updateSale,
  uploadSaleDocument,
  type CreateSaleBody,
  type ReturnSaleBody,
  type SaleListQuery,
  type UpdateSaleBody,
  type UploadSaleDocumentInput,
} from '@/services/http';
import { queryKeys } from '@/services/http/query-keys';

async function invalidateAfterStatusChange(
  client: ReturnType<typeof useQueryClient>,
  saleId: string,
): Promise<void> {
  await client.invalidateQueries({ queryKey: queryKeys.sales.all });
  await client.invalidateQueries({ queryKey: queryKeys.sales.history(saleId) });
  await client.invalidateQueries({ queryKey: queryKeys.sales.observations(saleId) });
  await client.invalidateQueries({ queryKey: queryKeys.administrative.all });
  await client.invalidateQueries({ queryKey: queryKeys.notifications.all });
}

export function useSalesQuery(query: MaybeRefOrGetter<SaleListQuery>) {
  return useQuery({
    queryKey: computed(() => queryKeys.sales.list(toValue(query))),
    queryFn: ({ signal }) => listSales(toValue(query), { signal }),
    placeholderData: keepPreviousData,
  });
}

export function useSaleQuery(
  id: MaybeRefOrGetter<string>,
  enabled: MaybeRefOrGetter<boolean> = true,
) {
  return useQuery({
    queryKey: computed(() => queryKeys.sales.detail(toValue(id))),
    queryFn: ({ signal }) => getSale(toValue(id), { signal }),
    enabled: computed(() => Boolean(toValue(id)) && toValue(enabled)),
  });
}

export function useSaleDocumentsQuery(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => queryKeys.sales.documents(toValue(id))),
    queryFn: ({ signal }) => getSaleDocuments(toValue(id), { signal }),
    enabled: computed(() => Boolean(toValue(id))),
  });
}

export function useSaleHistoryQuery(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => queryKeys.sales.history(toValue(id))),
    queryFn: ({ signal }) => getSaleHistory(toValue(id), { signal }),
    enabled: computed(() => Boolean(toValue(id))),
  });
}

export function useHealthInsurersQuery() {
  return useQuery({
    queryKey: queryKeys.healthInsurers.list(),
    queryFn: ({ signal }) => listHealthInsurers({ signal }),
  });
}

export function useHealthPlansQuery(insurerId: MaybeRefOrGetter<string | null>) {
  return useQuery({
    queryKey: computed(() => queryKeys.healthInsurers.plans(toValue(insurerId) ?? '')),
    queryFn: ({ signal }) => listHealthPlans(toValue(insurerId)!, { signal }),
    enabled: computed(() => Boolean(toValue(insurerId))),
  });
}

export function useCreateSaleMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateSaleBody = {}) => createSale(body),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.sales.all });
    },
  });
}

export function useUpdateSaleMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateSaleBody }) => updateSale(id, body),
    onSuccess: async (sale) => {
      client.setQueryData(queryKeys.sales.detail(sale.id), sale);
      await client.invalidateQueries({ queryKey: queryKeys.sales.all });
    },
  });
}

export function useSubmitSaleMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => submitSale(id),
    onSuccess: async (sale) => {
      client.setQueryData(queryKeys.sales.detail(sale.id), sale);
      await invalidateAfterStatusChange(client, sale.id);
    },
  });
}

export function useReturnSaleMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ReturnSaleBody }) => returnSale(id, body),
    onSuccess: async (sale) => {
      client.setQueryData(queryKeys.sales.detail(sale.id), sale);
      await invalidateAfterStatusChange(client, sale.id);
    },
  });
}

export function useExportSaleMutation() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { blob, filename } = await exportSaleExcel(id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    },
  });
}

export function useUploadSaleDocumentMutation(saleId: MaybeRefOrGetter<string>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: UploadSaleDocumentInput) => uploadSaleDocument(toValue(saleId), input),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.sales.documents(toValue(saleId)) });
    },
  });
}

export function useDeleteSaleDocumentMutation(saleId: MaybeRefOrGetter<string>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (documentId: string) => deleteSaleDocument(toValue(saleId), documentId),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.sales.documents(toValue(saleId)) });
    },
  });
}

export function useDownloadSaleDocumentMutation(saleId: MaybeRefOrGetter<string>) {
  return useMutation({
    mutationFn: async (input: { documentId: string; filename?: string | null }) => {
      const { blob, filename } = await downloadSaleDocument(
        toValue(saleId),
        input.documentId,
        input.filename ?? 'documento',
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    },
  });
}
