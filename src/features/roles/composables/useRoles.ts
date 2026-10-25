import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import { queryKeys } from '@/services/http/query-keys';
import { listPermissions, listRoles, replaceRolePermissions } from '@/services/http/roles.service';

export function useRolesQuery(enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: queryKeys.roles.list(),
    queryFn: ({ signal }) => listRoles({ signal }),
    enabled: computed(() => toValue(enabled)),
    staleTime: 5 * 60_000,
  });
}

export function usePermissionsQuery(enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: queryKeys.roles.permissions(),
    queryFn: ({ signal }) => listPermissions({ signal }),
    enabled: computed(() => toValue(enabled)),
    staleTime: 5 * 60_000,
  });
}

export function useReplaceRolePermissionsMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { roleId: string; permissionCodes: string[] }) =>
      replaceRolePermissions(input.roleId, input.permissionCodes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.roles.all }),
  });
}
