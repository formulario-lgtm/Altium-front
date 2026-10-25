import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import type { CreateTeamBody, TeamListQuery, UpdateTeamBody } from '@/services/http';
import { queryKeys } from '@/services/http/query-keys';
import {
  addTeamMember,
  createTeam,
  getTeam,
  listTeamMembers,
  listTeams,
  removeTeamMember,
  updateTeam,
} from '@/services/http/teams.service';
import { listUsers } from '@/services/http/users.service';

export function useTeamsQuery(query: MaybeRefOrGetter<TeamListQuery>) {
  return useQuery({
    queryKey: computed(() => queryKeys.teams.list(toValue(query))),
    queryFn: ({ signal }) => listTeams(toValue(query), { signal }),
    placeholderData: keepPreviousData,
  });
}

export function useTeamQuery(id: MaybeRefOrGetter<string>) {
  return useQuery({
    queryKey: computed(() => queryKeys.teams.detail(toValue(id))),
    queryFn: ({ signal }) => getTeam(toValue(id), { signal }),
  });
}

export function useTeamMembersQuery(
  id: MaybeRefOrGetter<string>,
  includeFormer: MaybeRefOrGetter<boolean>,
) {
  return useQuery({
    queryKey: computed(() => queryKeys.teams.members(toValue(id), toValue(includeFormer))),
    queryFn: ({ signal }) => listTeamMembers(toValue(id), toValue(includeFormer), { signal }),
  });
}

/**
 * ACTIVE users with one of `roleCodes` (supervisor / member pickers).
 * Reads the first 100 active users (API max page) and filters by role code client-side.
 */
export function useActiveUsersByRole(
  roleCodes: readonly string[],
  enabled: MaybeRefOrGetter<boolean>,
) {
  const query = useQuery({
    queryKey: computed(() => queryKeys.users.list({ status: 'ACTIVE', limit: 100, offset: 0 })),
    queryFn: ({ signal }) => listUsers({ status: 'ACTIVE', limit: 100, offset: 0 }, { signal }),
    enabled: computed(() => toValue(enabled)),
  });
  const users = computed(() =>
    (query.data.value?.items ?? []).filter((user) => roleCodes.includes(user.role.code)),
  );
  return { query, users };
}

function useInvalidateTeams() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.teams.all });
}

export function useCreateTeamMutation() {
  const invalidate = useInvalidateTeams();
  return useMutation({
    mutationFn: (body: CreateTeamBody) => createTeam(body),
    onSuccess: invalidate,
  });
}

export function useUpdateTeamMutation() {
  const invalidate = useInvalidateTeams();
  return useMutation({
    mutationFn: (input: { id: string; body: UpdateTeamBody }) => updateTeam(input.id, input.body),
    onSuccess: invalidate,
  });
}

export function useAddTeamMemberMutation() {
  const invalidate = useInvalidateTeams();
  return useMutation({
    mutationFn: (input: { teamId: string; userId: string }) =>
      addTeamMember(input.teamId, input.userId),
    onSuccess: invalidate,
  });
}

export function useRemoveTeamMemberMutation() {
  const invalidate = useInvalidateTeams();
  return useMutation({
    mutationFn: (input: { teamId: string; userId: string }) =>
      removeTeamMember(input.teamId, input.userId),
    onSuccess: invalidate,
  });
}
