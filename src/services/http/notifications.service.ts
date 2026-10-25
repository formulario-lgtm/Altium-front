import type {
  NotificationListQuery,
  UnreadCount,
  UserNotification,
  UserNotificationList,
} from './api-types';
import { apiClient, parseApiResult } from './client';
import { csrfHeaders } from './csrf';

type RequestOptions = { signal?: AbortSignal };

export async function listNotifications(
  query: NotificationListQuery = {},
  options?: RequestOptions,
): Promise<UserNotificationList> {
  const result = await apiClient.GET('/api/v1/notifications', {
    params: { query },
    signal: options?.signal,
  });
  return parseApiResult(result);
}

export async function getUnreadNotificationCount(options?: RequestOptions): Promise<UnreadCount> {
  const result = await apiClient.GET('/api/v1/notifications/unread-count', {
    signal: options?.signal,
  });
  return parseApiResult(result);
}

export async function markNotificationRead(id: string): Promise<UserNotification> {
  const result = await apiClient.PATCH('/api/v1/notifications/{id}/read', {
    params: { path: { id }, header: csrfHeaders() },
  });
  return parseApiResult(result);
}

export async function markAllNotificationsRead(): Promise<UnreadCount> {
  const result = await apiClient.POST('/api/v1/notifications/read-all', {
    params: { header: csrfHeaders() },
  });
  return parseApiResult(result);
}
