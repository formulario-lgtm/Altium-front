import { apiConfig } from '@/config/api';
import type {
  CreateSaleBody,
  CreateSaleFollowUpBody,
  CreateSaleObservationBody,
  PatchSaleAssigneeBody,
  ReturnSaleBody,
  ResolveSaleBody,
  Sale,
  SaleDocumentMeta,
  SaleDocuments,
  SaleDocumentType,
  SaleFollowUp,
  SaleFollowUpList,
  SaleList,
  SaleListQuery,
  SaleObservation,
  SaleObservationList,
  SaleStatusHistory,
  UpdateSaleBody,
} from './api-types';
import { apiClient, parseApiResult, parseEmptyResult, REQUEST_ID_HEADER } from './client';
import { CSRF_HEADER, csrfHeaders, getCsrfToken } from './csrf';
import { toApiErrorFromResponse } from './errors';
import { beginRequestLoading } from './loading';

type RequestOptions = { signal?: AbortSignal };

export type UploadSaleDocumentInput = {
  file: File;
  documentType: SaleDocumentType;
  saleMemberId?: string | null;
};

function createRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `req_${crypto.randomUUID().replace(/-/g, '').slice(0, 20)}`;
  }
  return `req_${Date.now().toString(36)}`;
}

function filenameFromDisposition(disposition: string | null, fallback: string): string {
  if (!disposition) return fallback;
  const match = /filename\*?=(?:UTF-8''|")?([^";]+)"?/i.exec(disposition);
  if (!match?.[1]) return fallback;
  try {
    return decodeURIComponent(match[1].replace(/"/g, ''));
  } catch {
    return match[1].replace(/"/g, '');
  }
}

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

export async function resolveSale(id: string, body: ResolveSaleBody): Promise<Sale> {
  const result = await apiClient.POST('/api/v1/sales/{id}/resolve', {
    params: { path: { id }, header: csrfHeaders() },
    body,
  });
  return parseApiResult(result);
}

export async function startSaleReview(id: string): Promise<Sale> {
  const result = await apiClient.POST('/api/v1/sales/{id}/start-review', {
    params: { path: { id }, header: csrfHeaders() },
  });
  return parseApiResult(result);
}

export async function setSaleAssignee(id: string, body: PatchSaleAssigneeBody): Promise<Sale> {
  const result = await apiClient.PATCH('/api/v1/sales/{id}/assignee', {
    params: { path: { id }, header: csrfHeaders() },
    body,
  });
  return parseApiResult(result);
}

export async function listSaleObservations(
  id: string,
  options?: RequestOptions,
): Promise<SaleObservationList> {
  const result = await apiClient.GET('/api/v1/sales/{id}/observations', {
    params: { path: { id } },
    signal: options?.signal,
  });
  return parseApiResult(result);
}

export async function createSaleObservation(
  id: string,
  body: CreateSaleObservationBody,
): Promise<SaleObservation> {
  const result = await apiClient.POST('/api/v1/sales/{id}/observations', {
    params: { path: { id }, header: csrfHeaders() },
    body,
  });
  return parseApiResult(result);
}

export async function resolveSaleObservation(
  id: string,
  observationId: string,
): Promise<SaleObservation> {
  const result = await apiClient.PATCH('/api/v1/sales/{id}/observations/{observationId}/resolve', {
    params: { path: { id, observationId }, header: csrfHeaders() },
  });
  return parseApiResult(result);
}

export async function listSaleFollowUps(
  id: string,
  options?: RequestOptions,
): Promise<SaleFollowUpList> {
  const result = await apiClient.GET('/api/v1/sales/{id}/follow-ups', {
    params: { path: { id } },
    signal: options?.signal,
  });
  return parseApiResult(result);
}

export async function createSaleFollowUp(
  id: string,
  body: CreateSaleFollowUpBody,
): Promise<SaleFollowUp> {
  const result = await apiClient.POST('/api/v1/sales/{id}/follow-ups', {
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

/**
 * Multipart upload — OpenAPI marks the body as opaque (`requestBody?: never`), so we post
 * `FormData` with the shared CSRF cookie session instead of inventing a typed JSON body.
 */
export async function uploadSaleDocument(
  id: string,
  input: UploadSaleDocumentInput,
): Promise<SaleDocumentMeta> {
  const body = new FormData();
  body.append('file', input.file);
  body.append('documentType', input.documentType);
  if (input.saleMemberId) {
    body.append('saleMemberId', input.saleMemberId);
  }

  const headers = new Headers({
    Accept: 'application/json',
    [REQUEST_ID_HEADER]: createRequestId(),
  });
  const csrf = getCsrfToken();
  if (csrf) {
    headers.set(CSRF_HEADER, csrf);
  }

  const release = beginRequestLoading();
  try {
    const response = await fetch(`${apiConfig.baseURL}/api/v1/sales/${id}/documents`, {
      method: 'POST',
      credentials: apiConfig.withCredentials ? 'include' : 'same-origin',
      headers,
      body,
    });

    if (!response.ok) {
      let problem: unknown;
      try {
        problem = await response.json();
      } catch {
        problem = undefined;
      }
      throw toApiErrorFromResponse(response, problem);
    }

    return (await response.json()) as SaleDocumentMeta;
  } finally {
    release();
  }
}

export async function deleteSaleDocument(id: string, documentId: string): Promise<void> {
  const result = await apiClient.DELETE('/api/v1/sales/{id}/documents/{documentId}', {
    params: { path: { id, documentId }, header: csrfHeaders() },
  });
  parseEmptyResult(result);
}

export async function downloadSaleDocument(
  id: string,
  documentId: string,
  fallbackFilename = 'documento',
): Promise<{ blob: Blob; filename: string }> {
  const result = await apiClient.GET('/api/v1/sales/{id}/documents/{documentId}/download', {
    params: { path: { id, documentId } },
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
  return {
    blob: result.data as Blob,
    filename: filenameFromDisposition(
      result.response.headers.get('content-disposition'),
      fallbackFilename,
    ),
  };
}

/** One ZIP; retain the global blocker until the response body is fully received. */
export async function downloadSaleDocuments(id: string): Promise<{ blob: Blob; filename: string }> {
  const release = beginRequestLoading();
  try {
    const result = await apiClient.GET('/api/v1/sales/{id}/documents/download', {
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
    return {
      blob: result.data,
      filename: filenameFromDisposition(
        result.response.headers.get('content-disposition'),
        'documentos-venta.zip',
      ),
    };
  } finally {
    release();
  }
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
  return {
    blob: result.data as Blob,
    filename: filenameFromDisposition(
      result.response.headers.get('content-disposition'),
      `venta-${id}.xlsx`,
    ),
  };
}
