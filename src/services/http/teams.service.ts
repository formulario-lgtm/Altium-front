import type {
  CreateTeamBody,
  Team,
  TeamList,
  TeamListQuery,
  TeamMember,
  TeamMemberList,
  UpdateTeamBody,
} from './api-types';
import { apiClient, parseApiResult, parseEmptyResult } from './client';
import { csrfHeaders } from './csrf';

type RequestOptions = { signal?: AbortSignal };

export async function listTeams(query: TeamListQuery, options?: RequestOptions): Promise<TeamList> {
  const result = await apiClient.GET('/api/v1/teams', {
    params: { query },
    signal: options?.signal,
  });
  return parseApiResult(result);
}

export async function getTeam(id: string, options?: RequestOptions): Promise<Team> {
  const result = await apiClient.GET('/api/v1/teams/{id}', {
    params: { path: { id } },
    signal: options?.signal,
  });
  return parseApiResult(result);
}

export async function createTeam(body: CreateTeamBody): Promise<Team> {
  const result = await apiClient.POST('/api/v1/teams', {
    params: { header: csrfHeaders() },
    body,
  });
  return parseApiResult(result);
}

export async function updateTeam(id: string, body: UpdateTeamBody): Promise<Team> {
  const result = await apiClient.PATCH('/api/v1/teams/{id}', {
    params: { path: { id }, header: csrfHeaders() },
    body,
  });
  return parseApiResult(result);
}

export async function listTeamMembers(
  id: string,
  includeFormer: boolean,
  options?: RequestOptions,
): Promise<TeamMemberList> {
  const result = await apiClient.GET('/api/v1/teams/{id}/members', {
    params: { path: { id }, query: includeFormer ? { includeFormer } : {} },
    signal: options?.signal,
  });
  return parseApiResult(result);
}

export async function addTeamMember(id: string, userId: string): Promise<TeamMember> {
  const result = await apiClient.POST('/api/v1/teams/{id}/members', {
    params: { path: { id }, header: csrfHeaders() },
    body: { userId },
  });
  return parseApiResult(result);
}

export async function removeTeamMember(id: string, userId: string): Promise<void> {
  const result = await apiClient.DELETE('/api/v1/teams/{id}/members/{userId}', {
    params: { path: { id, userId }, header: csrfHeaders() },
  });
  parseEmptyResult(result);
}
