<script setup lang="ts">
import { useRouter } from 'vue-router';
import EmptyState from '@/components/common/EmptyState.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import type { HomeSaleRef } from '@/services/http';
import { saleStatusLabel } from '@/features/sales/utils/sale-labels';
import { formatDateTime, formatSaleNumber } from '@/utils/format';

const props = withDefaults(
  defineProps<{
    sales: readonly HomeSaleRef[];
    emptyTitle?: string;
    emptyText?: string;
    /** Seller detail vs administrative review route. */
    reviewMode?: boolean;
  }>(),
  {
    emptyTitle: 'Sin operaciones',
    emptyText: 'No hay elementos para mostrar.',
    reviewMode: false,
  },
);

const router = useRouter();

function open(sale: HomeSaleRef): void {
  if (props.reviewMode) {
    void router.push({ name: 'admin-sale-review', params: { id: sale.id } });
    return;
  }
  void router.push({ name: 'sale-detail', params: { id: sale.id } });
}
</script>

<template>
  <EmptyState
    v-if="sales.length === 0"
    :title="emptyTitle"
    :text="emptyText"
    icon="mdi-clipboard-text-off-outline"
    compact
  />
  <v-list v-else lines="two" class="bg-transparent pa-0" data-testid="home-sale-list">
    <v-list-item
      v-for="sale in sales"
      :key="sale.id"
      class="home-sale-list__item"
      role="link"
      tabindex="0"
      @click="open(sale)"
      @keydown.enter="open(sale)"
    >
      <v-list-item-title>{{ formatSaleNumber(sale.saleNumber) }}</v-list-item-title>
      <v-list-item-subtitle>{{ formatDateTime(sale.updatedAt) }}</v-list-item-subtitle>
      <template #append>
        <StatusBadge :label="saleStatusLabel(sale.status)" :status="sale.status" />
      </template>
    </v-list-item>
  </v-list>
</template>

<style scoped lang="scss">
.home-sale-list__item {
  cursor: pointer;
  border-radius: 8px;

  &:hover {
    background: rgba(var(--v-theme-primary), 0.06);
  }
}
</style>
