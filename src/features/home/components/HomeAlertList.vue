<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';
import { useRouter } from 'vue-router';
import EmptyState from '@/components/common/EmptyState.vue';
import type { HomeAlert } from '@/services/http';
import { HOME_ALERT_SEVERITY_COLOR } from '../utils/home-labels';

const props = defineProps<{
  alerts: readonly HomeAlert[];
  emptyTitle?: string;
  emptyText?: string;
  resolveRoute?: (alert: HomeAlert) => RouteLocationRaw | null;
}>();

const router = useRouter();

function open(alert: HomeAlert): void {
  const to = props.resolveRoute?.(alert) ?? null;
  if (to) void router.push(to);
}

function clickable(alert: HomeAlert): boolean {
  return Boolean(props.resolveRoute?.(alert));
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
      :class="{ 'home-alert-list__item--clickable': clickable(alert) }"
      :role="clickable(alert) ? 'link' : undefined"
      :tabindex="clickable(alert) ? 0 : undefined"
      @click="clickable(alert) && open(alert)"
      @keydown.enter="clickable(alert) && open(alert)"
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
      <v-list-item-title>{{ alert.title }}</v-list-item-title>
      <v-list-item-subtitle>{{ alert.description }}</v-list-item-subtitle>
      <template #append>
        <v-chip
          v-if="alert.count != null"
          size="small"
          variant="tonal"
          :color="HOME_ALERT_SEVERITY_COLOR[alert.severity]"
        >
          {{ alert.count }}
        </v-chip>
      </template>
    </v-list-item>
  </v-list>
</template>

<style scoped lang="scss">
.home-alert-list__item--clickable {
  cursor: pointer;
  border-radius: 8px;

  &:hover {
    background: rgba(var(--v-theme-primary), 0.06);
  }
}
</style>
