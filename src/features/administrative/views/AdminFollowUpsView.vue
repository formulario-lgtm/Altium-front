<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import EmptyState from '@/components/common/EmptyState.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useDebouncedRef } from '@/composables/useDebouncedRef';
import { useAdministrativeDashboardQuery } from '@/features/administrative/composables/useAdministrative';
import { useSalesQuery } from '@/features/sales/composables/useSales';
import { customerTypeLabel } from '@/features/sales/utils/sale-labels';
import { saleListSearchParams } from '@/features/sales/utils/sale-search';
import {
  apiErrorMessage,
  isApiError,
  type SaleListItem,
  type SaleListQuery,
  type SaleStatus,
} from '@/services/http';
import { formatDateTime, formatSaleNumber } from '@/utils/format';

const router = useRouter();
const dashboardQuery = useAdministrativeDashboardQuery();

const page = ref(1);
const itemsPerPage = ref(25);
const search = ref('');
const debouncedSearch = useDebouncedRef(search);
const statusFilter = ref<SaleStatus | null>('IN_REVIEW');

watch([debouncedSearch, statusFilter], () => {
  page.value = 1;
});

const listQuery = computed<SaleListQuery>(() => {
  const query: SaleListQuery = {
    limit: itemsPerPage.value,
    offset: (page.value - 1) * itemsPerPage.value,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  };
  Object.assign(query, saleListSearchParams(debouncedSearch.value));
  if (statusFilter.value) query.status = statusFilter.value;
  return query;
});

const salesQuery = useSalesQuery(listQuery);
const items = computed(() => salesQuery.data.value?.items ?? []);
const total = computed(() => salesQuery.data.value?.pageInfo.total ?? 0);
const pendingCount = computed(() => dashboardQuery.data.value?.pendingFollowUps ?? 0);

const statusItems = [
  { title: 'En revisión', value: 'IN_REVIEW' },
  { title: 'Presentadas', value: 'SUBMITTED' },
  { title: 'Devueltas', value: 'RETURNED' },
];

const headers = [
  { title: 'Número', key: 'saleNumber', sortable: false },
  { title: 'Titular', key: 'holder', sortable: false },
  { title: 'Vendedor', key: 'seller', sortable: false },
  { title: 'Estado', key: 'status', sortable: false },
  { title: 'Tipo', key: 'customerType', sortable: false },
  { title: 'Fecha de creación', key: 'createdAt', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
];

function holderLabel(item: SaleListItem): string {
  const name = [item.holderLastName, item.holderFirstName].filter(Boolean).join(', ');
  return name || 'Sin titular';
}

function openFollowUps(id: string): void {
  void router.push({
    name: 'admin-sale-review',
    params: { id },
    query: { section: 'followUps' },
  });
}
</script>

<template>
  <div data-testid="admin-follow-ups">
    <PageHeader
      title="Seguimientos"
      subtitle="Cola de ventas para registrar gestiones. El detalle muestra el historial por operación."
    />

    <v-alert type="info" variant="tonal" class="mb-4" density="comfortable">
      <strong>{{ pendingCount }}</strong>
      seguimientos con próxima acción vencida o pendiente (alcance actual). No hay listado global de
      gestiones en el contrato; se trabaja desde cada venta.
    </v-alert>

    <v-row dense class="altium-filters mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          label="Buscar venta"
          prepend-inner-icon="mdi-magnify"
          clearable
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-select v-model="statusFilter" :items="statusItems" label="Estado" clearable />
      </v-col>
    </v-row>

    <ErrorState
      v-if="salesQuery.error.value"
      :message="apiErrorMessage(salesQuery.error.value)"
      :request-id="isApiError(salesQuery.error.value) ? salesQuery.error.value.requestId : null"
      @retry="salesQuery.refetch()"
    />

    <v-card v-else>
      <v-data-table-server
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        :headers="headers"
        :items="items"
        :items-length="total"
        :loading="salesQuery.isFetching.value"
        item-value="id"
      >
        <template #[`item.saleNumber`]="{ item }">
          {{ formatSaleNumber(item.saleNumber) }}
        </template>
        <template #[`item.holder`]="{ item }">{{ holderLabel(item) }}</template>
        <template #[`item.seller`]="{ item }">
          {{ item.seller.lastName }}, {{ item.seller.firstName }}
        </template>
        <template #[`item.status`]="{ item }">
          <StatusBadge :status="item.status" />
        </template>
        <template #[`item.customerType`]="{ item }">
          {{ customerTypeLabel(item.customerType) }}
        </template>
        <template #[`item.createdAt`]="{ item }">{{ formatDateTime(item.createdAt) }}</template>
        <template #[`item.actions`]="{ item }">
          <v-btn size="small" variant="tonal" color="primary" @click="openFollowUps(item.id)">
            Gestiones
          </v-btn>
        </template>
        <template #no-data>
          <EmptyState
            title="Sin operaciones"
            text="Ajustá los filtros o iniciá revisiones desde Gestión de ventas."
          />
        </template>
      </v-data-table-server>
    </v-card>
  </div>
</template>
