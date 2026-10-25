import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import {
  getUnreadNotificationCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationListQuery,
} from '@/services/http';
import { queryKeys } from '@/services/http/query-keys';

export function useNotificationsQuery(
  query: MaybeRefOrGetter<NotificationListQuery>,
  enabled: MaybeRefOrGetter<boolean> = true,
) {
  return useQuery({
    queryKey: computed(() => queryKeys.notifications.list(toValue(query))),
    queryFn: ({ signal }) => listNotifications(toValue(query), { signal }),
    enabled: computed(() => toValue(enabled)),
    placeholderData: keepPreviousData,
  });
}

export function useUnreadNotificationCountQuery(enabled: MaybeRefOrGetter<boolean> = true) {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: ({ signal }) => getUnreadNotificationCount({ signal }),
    enabled: computed(() => toValue(enabled)),
    refetchInterval: 60_000,
  });
}

export function useMarkNotificationReadMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useMarkAllNotificationsReadMutation() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}
