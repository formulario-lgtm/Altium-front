<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';
import { useRouter } from 'vue-router';
import EmptyState from '@/components/common/EmptyState.vue';
import type { HomeAlert } from '@/services/http';
import { HOME_ALERT_SEVERITY_COLOR } from '../utils/home-labels';
import { useAuthStore } from '@/stores/auth.store';
import { accessibleHomeRoute } from '../utils/home-navigation';

const props = defineProps<{
  alerts: readonly HomeAlert[];
  emptyTitle?: string;
  emptyText?: string;
  resolveRoute?: (alert: HomeAlert) => RouteLocationRaw | null;
}>();

const router = useRouter();
const auth = useAuthStore();
function destination(alert: HomeAlert): RouteLocationRaw | undefined {
  return (
    accessibleHomeRoute(router, props.resolveRoute?.(alert) ?? null, auth.hasPermission) ??
    undefined
  );
}
</script>

<template>
  <EmptyState
    v-if="alerts.length === 0"
    :title="emptyTitle ?? 'Sin pendientes'"
    :text="emptyText ?? 'No hay alertas para este período.'"
    icon="mdi-check-circle-outline"
    compact
  />
  <v-list v-else lines="two" class="bg-transparent pa-0" data-testid="home-alert-list">
    <v-list-item
      v-for="alert in alerts"
      :key="`${alert.code}-${alert.entityId ?? alert.title}`"
      :value="`${alert.code}-${alert.entityId ?? alert.title}`"
      :to="destination(alert)"
    >
      <template #prepend>
        <v-avatar
          :color="HOME_ALERT_SEVERITY_COLOR[alert.severity]"
          variant="tonal"
          size="36"
          rounded="lg"
        >
          <v-icon icon="mdi-alert-circle-outline" size="20" />
        </v-avatar>
      </template>
      <v-list-item-title class="text-wrap">{{ alert.title }}</v-list-item-title>
      <v-list-item-subtitle class="text-wrap">{{ alert.description }}</v-list-item-subtitle>
      <template #append>
        <v-chip
          v-if="alert.count != null"
          size="small"
          variant="tonal"
          :color="HOME_ALERT_SEVERITY_COLOR[alert.severity]"
        >
          {{ alert.count }}
        </v-chip>
        <v-icon
          v-if="destination(alert)"
          icon="mdi-chevron-right"
          size="18"
          class="text-medium-emphasis ml-2"
        />
      </template>
    </v-list-item>
  </v-list>
</template>
