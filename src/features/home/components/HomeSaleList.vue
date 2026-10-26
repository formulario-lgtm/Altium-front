<script setup lang="ts">
import { useAuthStore } from '@/stores/auth.store';
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
    /** Explicit sale labels and next action for the seller workspace. */
    showAction?: boolean;
    holderNames?: Readonly<Record<string, string>>;
  }>(),
  {
    emptyTitle: 'Sin operaciones',
    emptyText: 'No hay elementos para mostrar.',
    reviewMode: false,
    showAction: false,
    holderNames: undefined,
  },
);

const auth = useAuthStore();

function saleRoute(sale: HomeSaleRef) {
  if (props.reviewMode) {
    return { name: 'admin-sale-review', params: { id: sale.id } };
  }
  return { name: canContinue(sale) ? 'sale-edit' : 'sale-detail', params: { id: sale.id } };
}

function canContinue(sale: HomeSaleRef): boolean {
  return (
    props.showAction &&
    !props.reviewMode &&
    auth.hasPermission('sales.update') &&
    (sale.status === 'DRAFT' || sale.status === 'RETURNED')
  );
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
      :value="sale.id"
      class="home-sale-list__item"
      :to="saleRoute(sale)"
    >
      <v-list-item-title :class="{ 'font-weight-medium': showAction, 'text-wrap': holderNames }">
        {{ showAction ? 'Venta ' : '' }}{{ formatSaleNumber(sale.saleNumber)
        }}<template v-if="holderNames">
          -
          <span data-testid="home-sale-holder">{{
            holderNames[sale.id] || 'Titular sin completar'
          }}</span></template
        >
      </v-list-item-title>
      <v-list-item-subtitle
        >{{ showAction ? 'Actualizada ' : ''
        }}{{ formatDateTime(sale.updatedAt) }}</v-list-item-subtitle
      >
      <template #append>
        <div class="d-flex align-center ga-3">
          <div class="text-end">
            <StatusBadge :label="saleStatusLabel(sale.status)" :status="sale.status" />
            <span v-if="showAction" class="d-block text-caption text-primary mt-1">{{
              canContinue(sale)
                ? sale.status === 'RETURNED'
                  ? 'Corregir'
                  : 'Continuar'
                : reviewMode
                  ? 'Revisar'
                  : 'Ver detalle'
            }}</span>
          </div>
          <v-icon
            v-if="showAction"
            icon="mdi-chevron-right"
            size="18"
            class="text-medium-emphasis"
          />
        </div>
      </template>
    </v-list-item>
  </v-list>
</template>

<style scoped lang="scss">
.home-sale-list__item {
  cursor: pointer;
  border-radius: var(--altium-radius-sm);

  &:hover {
    background: rgba(var(--v-theme-primary), 0.06);
  }
}
</style>
