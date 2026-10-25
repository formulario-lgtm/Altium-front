import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import type {
  CreateUserBody,
  SettableUserStatus,
  UpdateUserBody,
  UserListQuery,
} from '@/services/http';
import { queryKeys } from '@/services/http/query-keys';
import {
  createUser,
  listUsers,
  requestUserPasswordReset,
  updateUser,
  updateUserStatus,
} from '@/services/http/users.service';

export function useUsersQuery(
  query: MaybeRefOrGetter<UserListQuery>,
  enabled: MaybeRefOrGetter<boolean> = true,
) {
  return useQuery({
    queryKey: computed(() => queryKeys.users.list(toValue(query))),
    queryFn: ({ signal }) => listUsers(toValue(query), { signal }),
    enabled: computed(() => toValue(enabled)),
    placeholderData: keepPreviousData,
  });
}

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
}

export function useCreateUserMutation() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (body: CreateUserBody) => createUser(body),
    onSuccess: invalidate,
  });
}

export function useUpdateUserMutation() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (input: { id: string; body: UpdateUserBody }) => updateUser(input.id, input.body),
    onSuccess: invalidate,
  });
}

export function useUpdateUserStatusMutation() {
  const invalidate = useInvalidateUsers();
  return useMutation({
    mutationFn: (input: { id: string; status: SettableUserStatus }) =>
      updateUserStatus(input.id, input.status),
    onSuccess: invalidate,
  });
}

export function useRequestUserPasswordResetMutation() {
  return useMutation({ mutationFn: (id: string) => requestUserPasswordReset(id) });
}
