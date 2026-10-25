import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { listSessions, revokeSession } from '@/services/http/auth.service';
import { queryKeys } from '@/services/http/query-keys';

export function useSessionsQuery() {
  return useQuery({
    queryKey: queryKeys.auth.sessions(),
    queryFn: ({ signal }) => listSessions({ signal }),
  });
}

/** Revokes another session of the current user (the current one ends via logout). */
export function useRevokeSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => revokeSession(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.auth.sessions() }),
  });
}
