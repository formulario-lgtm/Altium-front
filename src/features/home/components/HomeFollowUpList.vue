<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import EmptyState from '@/components/common/EmptyState.vue';
import type { HomeFollowUpRef } from '@/services/http';
import { formatDateTime, formatSaleNumber } from '@/utils/format';
import { accessibleHomeRoute } from '../utils/home-navigation';

defineProps<{
  items: readonly HomeFollowUpRef[];
  emptyTitle?: string;
  emptyText?: string;
}>();

const router = useRouter();
const auth = useAuthStore();

function destination(item: HomeFollowUpRef) {
  return (
    accessibleHomeRoute(
      router,
      {
        name: 'admin-sale-review',
        params: { id: item.saleId },
        query: { section: 'followUps' },
      },
      auth.hasPermission,
    ) ?? undefined
  );
}
</script>

<template>
  <EmptyState
    v-if="items.length === 0"
    :title="emptyTitle ?? 'Sin seguimientos próximos'"
    :text="emptyText ?? 'No hay seguimientos programados en tu alcance.'"
    icon="mdi-calendar-check-outline"
    compact
  />
  <v-list v-else lines="two" class="bg-transparent pa-0" data-testid="home-follow-up-list">
    <v-list-item
      v-for="item in items"
      :key="item.id"
      :value="item.id"
      class="home-follow-up-list__item"
      :to="destination(item)"
    >
      <v-list-item-title class="text-wrap font-weight-medium"
        >Venta {{ formatSaleNumber(item.saleNumber) }}</v-list-item-title
      >
      <p class="text-body-2 text-wrap my-1">{{ item.description }}</p>
      <v-list-item-subtitle>{{
        item.nextFollowUpAt ? formatDateTime(item.nextFollowUpAt) : 'Sin fecha programada'
      }}</v-list-item-subtitle>
      <template #append
        ><v-icon
          v-if="destination(item)"
          icon="mdi-chevron-right"
          size="18"
          class="text-medium-emphasis"
      /></template>
    </v-list-item>
  </v-list>
</template>

<style scoped lang="scss">
.home-follow-up-list__item {
  cursor: pointer;
  border-radius: var(--altium-radius-sm);

  &:hover {
    background: rgba(var(--v-theme-primary), 0.06);
  }
}
</style>
