<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import {
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  useNotificationsQuery,
  useUnreadNotificationCountQuery,
} from '@/features/notifications/composables/useNotifications';
import { apiErrorMessage, type UserNotification } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import { formatDateTime } from '@/utils/format';

const auth = useAuthStore();
const router = useRouter();
const menuOpen = ref(false);

const enabled = computed(() => auth.hasPermission('notifications.read'));
const listQuery = computed(() => ({ limit: 12, offset: 0 }));
const unreadQuery = useUnreadNotificationCountQuery(enabled);
const listNotificationsQuery = useNotificationsQuery(listQuery, enabled);
const markReadMutation = useMarkNotificationReadMutation();
const markAllMutation = useMarkAllNotificationsReadMutation();

const unreadCount = computed(() => unreadQuery.data.value?.count ?? 0);
const items = computed(() => listNotificationsQuery.data.value?.items ?? []);
const badge = computed(() => (unreadCount.value > 99 ? '99+' : String(unreadCount.value)));

async function openNotification(row: UserNotification): Promise<void> {
  if (!row.readAt) {
    try {
      await markReadMutation.mutateAsync(row.id);
    } catch {
      /* navigation still proceeds */
    }
  }
  menuOpen.value = false;
  if (row.entityType === 'sale' && row.entityId) {
    const isAdmin = auth.hasPermission('sales.review');
    void router.push({
      name: isAdmin ? 'admin-sale-review' : 'sale-detail',
      params: { id: row.entityId },
    });
  }
}

async function markAll(): Promise<void> {
  try {
    await markAllMutation.mutateAsync();
  } catch {
    /* ignore; list will show previous state */
  }
}
</script>

<template>
  <v-menu
    v-if="enabled"
    v-model="menuOpen"
    location="bottom end"
    :offset="10"
    :close-on-content-click="false"
  >
    <template #activator="{ props: menuProps }">
      <v-btn
        v-bind="menuProps"
        icon
        variant="text"
        aria-label="Notificaciones"
        data-testid="notifications-menu"
      >
        <v-badge v-if="unreadCount > 0" :content="badge" color="error" floating>
          <v-icon icon="mdi-bell-outline" />
        </v-badge>
        <v-icon v-else icon="mdi-bell-outline" />
      </v-btn>
    </template>

    <v-card class="notifications-menu" max-height="480" border>
      <div class="d-flex align-center justify-space-between px-4 pt-3 pb-2">
        <p class="text-subtitle-2 font-weight-bold mb-0">Notificaciones</p>
        <v-btn
          size="small"
          variant="text"
          :disabled="unreadCount === 0"
          :loading="markAllMutation.isPending.value"
          @click="markAll"
        >
          Marcar todas
        </v-btn>
      </div>
      <v-divider />
      <v-list v-if="items.length" density="comfortable" class="py-1">
        <v-list-item
          v-for="row in items"
          :key="row.id"
          :class="{ 'notifications-menu__unread': !row.readAt }"
          class="py-3"
          rounded="lg"
          @click="openNotification(row)"
        >
          <v-list-item-title class="text-subtitle-1 font-weight-bold text-wrap mb-1">{{
            row.title
          }}</v-list-item-title>
          <div class="notifications-menu__details text-medium-emphasis">
            <p class="text-body-2 text-truncate mb-0" :title="row.message">{{ row.message }}</p>
            <time class="text-caption" :datetime="row.createdAt">{{
              formatDateTime(row.createdAt)
            }}</time>
          </div>
        </v-list-item>
      </v-list>
      <p v-else-if="listNotificationsQuery.isLoading.value" class="text-body-2 pa-4 mb-0">
        Cargando…
      </p>
      <p v-else-if="listNotificationsQuery.error.value" class="text-body-2 text-error pa-4 mb-0">
        {{ apiErrorMessage(listNotificationsQuery.error.value) }}
      </p>
      <p v-else class="text-body-2 text-medium-emphasis pa-4 mb-0">No hay notificaciones.</p>
    </v-card>
  </v-menu>
</template>

<style scoped lang="scss">
.notifications-menu {
  width: min(520px, calc(100vw - 24px));
  overflow: auto;
  border-radius: var(--altium-radius-xl, 1.25rem) !important;
}

.notifications-menu__details {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: baseline;
  gap: 12px;

  time {
    white-space: nowrap;
  }
}

.notifications-menu__unread {
  background: rgba(var(--v-theme-primary), 0.06);
}
</style>
