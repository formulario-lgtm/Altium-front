import type {
  CreateSaleBody,
  ReturnSaleBody,
  Sale,
  SaleDocuments,
  SaleList,
  SaleListQuery,
  SaleStatusHistory,
  UpdateSaleBody,
} from './api-types';
import { apiClient, parseApiResult } from './client';
import { csrfHeaders } from './csrf';
import { toApiErrorFromResponse } from './errors';

type RequestOptions = { signal?: AbortSignal };

export async function listSales(query: SaleListQuery, options?: RequestOptions): Promise<SaleList> {
  const result = await apiClient.GET('/api/v1/sales', {
    params: { query },
    signal: options?.signal,
  });
  return parseApiResult(result);
}

export async function getSale(id: string, options?: RequestOptions): Promise<Sale> {
  const result = await apiClient.GET('/api/v1/sales/{id}', {
    params: { path: { id } },
    signal: options?.signal,
  });
  return parseApiResult(result);
}

export async function createSale(body: CreateSaleBody = {}): Promise<Sale> {
  const result = await apiClient.POST('/api/v1/sales', {
    params: { header: csrfHeaders() },
    body,
  });
  return parseApiResult(result);
}

export async function updateSale(id: string, body: UpdateSaleBody): Promise<Sale> {
  const result = await apiClient.PATCH('/api/v1/sales/{id}', {
    params: { path: { id }, header: csrfHeaders() },
    body,
  });
  return parseApiResult(result);
}

export async function submitSale(id: string): Promise<Sale> {
  const result = await apiClient.POST('/api/v1/sales/{id}/submit', {
    params: { path: { id }, header: csrfHeaders() },
  });
  return parseApiResult(result);
}

export async function returnSale(id: string, body: ReturnSaleBody): Promise<Sale> {
  const result = await apiClient.POST('/api/v1/sales/{id}/return', {
    params: { path: { id }, header: csrfHeaders() },
    body,
  });
  return parseApiResult(result);
}

export async function getSaleHistory(
  id: string,
  options?: RequestOptions,
): Promise<SaleStatusHistory> {
  const result = await apiClient.GET('/api/v1/sales/{id}/history', {
    params: { path: { id } },
    signal: options?.signal,
  });
  return parseApiResult(result);
}

export async function getSaleDocuments(
  id: string,
  options?: RequestOptions,
): Promise<SaleDocuments> {
  const result = await apiClient.GET('/api/v1/sales/{id}/documents', {
    params: { path: { id } },
    signal: options?.signal,
  });
  return parseApiResult(result);
}

/** Binary export — uses parseAs blob from the typed client. */
export async function exportSaleExcel(id: string): Promise<{ blob: Blob; filename: string }> {
  const result = await apiClient.GET('/api/v1/sales/{id}/export', {
    params: { path: { id } },
    parseAs: 'blob',
  });
  if (result.error || !result.data) {
    if (result.response) {
      let body: unknown = result.error;
      try {
        body = await result.response.clone().json();
      } catch {
        /* keep result.error */
      }
      throw toApiErrorFromResponse(result.response, body);
    }
    throw result.error;
  }
  const disposition = result.response.headers.get('content-disposition') ?? '';
  const match = /filename="?([^";]+)"?/i.exec(disposition);
  return {
    blob: result.data as Blob,
    filename: match?.[1] ?? `venta-${id}.xlsx`,
  };
}
