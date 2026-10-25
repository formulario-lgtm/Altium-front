import type {
  AdministrativeDetail,
  AdministrativeListResponse,
  CreateMonthlyGoalBody,
  MonthlyGoal,
  MonthlyGoalHistory,
  MonthlyGoalList,
  PatchMonthlyGoalBody,
  SellerComparisonResponse,
  SellerDetail,
  SellerListResponse,
  SupervisionAdministrativeListQuery,
  SupervisionDashboard,
  SupervisionGoalsQuery,
  SupervisionPeriodQuery,
  SupervisionSellerListQuery,
} from './api-types';
import { apiClient, parseApiResult } from './client';
import { csrfHeaders } from './csrf';

type RequestOptions = { signal?: AbortSignal };

/** OpenAPI emits some nullable UUID/string fields as `{}`; normalize for app code. */
function asNullableString(value: unknown): string | null {
  return typeof value === 'string' ? value : null;
}

function normalizeSellerList(raw: SellerListResponse): SellerListResponse {
  return {
    items: raw.items.map((item) => ({
      ...item,
      teamId: asNullableString(item.teamId),
      teamName: asNullableString(item.teamName),
    })),
  };
}

function normalizeAdministrativeList(raw: AdministrativeListResponse): AdministrativeListResponse {
  return {
    items: raw.items.map((item) => ({
      ...item,
      teamId: asNullableString(item.teamId),
      teamName: asNullableString(item.teamName),
    })),
  };
}

function normalizeGoal(raw: MonthlyGoal): MonthlyGoal {
  return {
    ...raw,
    teamId: asNullableString(raw.teamId),
    userId: asNullableString(raw.userId),
  };
}

function normalizeGoalList(raw: MonthlyGoalList): MonthlyGoalList {
  return { items: raw.items.map(normalizeGoal) };
}

function normalizeGoalHistory(raw: MonthlyGoalHistory): MonthlyGoalHistory {
  return {
    items: raw.items.map((item) => ({
      ...item,
      reason: asNullableString(item.reason),
    })),
  };
}

export async function getSupervisionDashboard(
  query: SupervisionPeriodQuery,
  options?: RequestOptions,
): Promise<SupervisionDashboard> {
  const result = await apiClient.GET('/api/v1/supervision/dashboard', {
    params: { query },
    signal: options?.signal,
  });
  return parseApiResult(result);
}

export async function listSupervisionSellers(
  query: SupervisionSellerListQuery,
  options?: RequestOptions,
): Promise<SellerListResponse> {
  const result = await apiClient.GET('/api/v1/supervision/sellers', {
    params: { query },
    signal: options?.signal,
  });
  return normalizeSellerList(parseApiResult(result) as SellerListResponse);
}

export async function getSupervisionSeller(
  id: string,
  query: SupervisionPeriodQuery,
  options?: RequestOptions,
): Promise<SellerDetail> {
  const result = await apiClient.GET('/api/v1/supervision/sellers/{id}', {
    params: { path: { id }, query },
    signal: options?.signal,
  });
  return parseApiResult(result);
}

export async function compareSupervisionSellers(
  query: SupervisionPeriodQuery & { sellerIds: string[] },
  options?: RequestOptions,
): Promise<SellerComparisonResponse> {
  const result = await apiClient.GET('/api/v1/supervision/sellers/comparison', {
    params: {
      query: {
        year: query.year,
        month: query.month,
        teamId: query.teamId,
        sellerIds: query.sellerIds,
      },
    },
    signal: options?.signal,
  });
  return parseApiResult(result);
}

export async function listSupervisionAdministratives(
  query: SupervisionAdministrativeListQuery,
  options?: RequestOptions,
): Promise<AdministrativeListResponse> {
  const result = await apiClient.GET('/api/v1/supervision/administratives', {
    params: { query },
    signal: options?.signal,
  });
  return normalizeAdministrativeList(parseApiResult(result) as AdministrativeListResponse);
}

export async function getSupervisionAdministrative(
  id: string,
  query: SupervisionPeriodQuery,
  options?: RequestOptions,
): Promise<AdministrativeDetail> {
  const result = await apiClient.GET('/api/v1/supervision/administratives/{id}', {
    params: { path: { id }, query },
    signal: options?.signal,
  });
  return parseApiResult(result);
}

export async function listSupervisionGoals(
  query: SupervisionGoalsQuery,
  options?: RequestOptions,
): Promise<MonthlyGoalList> {
  const result = await apiClient.GET('/api/v1/supervision/goals', {
    params: { query },
    signal: options?.signal,
  });
  return normalizeGoalList(parseApiResult(result) as MonthlyGoalList);
}

export async function createSupervisionGoal(body: CreateMonthlyGoalBody): Promise<MonthlyGoal> {
  const result = await apiClient.POST('/api/v1/supervision/goals', {
    params: { header: csrfHeaders() },
    // Contract generator maps nullable UUID → `Record<string, never>`; runtime is string.
    body: body as never,
  });
  return normalizeGoal(parseApiResult(result) as MonthlyGoal);
}

export async function patchSupervisionGoal(
  id: string,
  body: PatchMonthlyGoalBody,
): Promise<MonthlyGoal> {
  const result = await apiClient.PATCH('/api/v1/supervision/goals/{id}', {
    params: { path: { id }, header: csrfHeaders() },
    body,
  });
  return normalizeGoal(parseApiResult(result) as MonthlyGoal);
}

export async function getSupervisionGoalHistory(
  id: string,
  options?: RequestOptions,
): Promise<MonthlyGoalHistory> {
  const result = await apiClient.GET('/api/v1/supervision/goals/{id}/history', {
    params: { path: { id } },
    signal: options?.signal,
  });
  return normalizeGoalHistory(parseApiResult(result) as MonthlyGoalHistory);
}
