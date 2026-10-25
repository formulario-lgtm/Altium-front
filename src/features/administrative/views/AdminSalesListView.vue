<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import EmptyState from '@/components/common/EmptyState.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useDebouncedRef } from '@/composables/useDebouncedRef';
import {
  apiErrorMessage,
  isApiError,
  type SaleCustomerType,
  type SaleListItem,
  type SaleListQuery,
  type SaleStatus,
} from '@/services/http';
import { formatDateTime, formatSaleNumber } from '@/utils/format';
import {
  useHealthInsurersQuery,
  useHealthPlansQuery,
  useSalesQuery,
} from '@/features/sales/composables/useSales';
import {
  ADMIN_SALE_STATUS_OPTIONS,
  CUSTOMER_TYPE_OPTIONS,
  customerTypeLabel,
} from '@/features/sales/utils/sale-labels';
import { saleListSearchParams } from '@/features/sales/utils/sale-search';

const route = useRoute();
const router = useRouter();

const page = ref(1);
const itemsPerPage = ref(25);
const search = ref('');
const debouncedSearch = useDebouncedRef(search);
const statusFilter = ref<SaleStatus | null>((route.query.status as SaleStatus | undefined) ?? null);
const customerTypeFilter = ref<SaleCustomerType | null>(null);
const insurerFilter = ref<string | null>(null);
const planFilter = ref<string | null>(null);
const createdFrom = ref<string | null>(null);
const createdTo = ref<string | null>(null);

watch(
  () => route.query.status,
  (value) => {
    statusFilter.value = (value as SaleStatus | undefined) ?? null;
  },
);

watch(
  [
    debouncedSearch,
    statusFilter,
    customerTypeFilter,
    insurerFilter,
    planFilter,
    createdFrom,
    createdTo,
  ],
  () => {
    page.value = 1;
  },
);

watch(insurerFilter, () => {
  planFilter.value = null;
});

watch(statusFilter, (value) => {
  const nextQuery = { ...route.query };
  if (value) nextQuery.status = value;
  else delete nextQuery.status;
  void router.replace({ query: nextQuery });
});

const insurersQuery = useHealthInsurersQuery();
const plansQuery = useHealthPlansQuery(insurerFilter);

const listQuery = computed<SaleListQuery>(() => {
  const query: SaleListQuery = {
    limit: itemsPerPage.value,
    offset: (page.value - 1) * itemsPerPage.value,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  };
  Object.assign(query, saleListSearchParams(debouncedSearch.value));
  if (statusFilter.value) query.status = statusFilter.value;
  if (customerTypeFilter.value) query.customerType = customerTypeFilter.value;
  if (insurerFilter.value) query.healthInsurerId = insurerFilter.value;
  if (planFilter.value) query.healthPlanId = planFilter.value;
  if (createdFrom.value) query.createdFrom = new Date(createdFrom.value).toISOString();
  if (createdTo.value) query.createdTo = new Date(`${createdTo.value}T23:59:59`).toISOString();
  return query;
});

const salesQuery = useSalesQuery(listQuery);
const items = computed(() => salesQuery.data.value?.items ?? []);
const total = computed(() => salesQuery.data.value?.pageInfo.total ?? 0);
const loadError = computed(() => salesQuery.error.value);

const insurerItems = computed(() =>
  (insurersQuery.data.value?.items ?? []).map((row) => ({ title: row.name, value: row.id })),
);
const planItems = computed(() =>
  (plansQuery.data.value?.items ?? []).map((row) => ({ title: row.name, value: row.id })),
);

const headers = [
  { title: 'Número', key: 'saleNumber', sortable: false },
  { title: 'Titular', key: 'holder', sortable: false },
  { title: 'Vendedor', key: 'seller', sortable: false },
  { title: 'Prepaga', key: 'healthInsurerName', sortable: false },
  { title: 'Plan', key: 'healthPlanName', sortable: false },
  { title: 'Tipo', key: 'customerType', sortable: false },
  { title: 'Estado', key: 'status', sortable: false },
  { title: 'Fecha de creación', key: 'createdAt', sortable: false },
  { title: 'Presentación', key: 'submittedAt', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
];

function holderLabel(item: SaleListItem): string {
  const name = [item.holderLastName, item.holderFirstName].filter(Boolean).join(', ');
  return name || 'Sin titular';
}

function sellerLabel(item: SaleListItem): string {
  return `${item.seller.lastName}, ${item.seller.firstName}`;
}

function openReview(id: string): void {
  void router.push({ name: 'admin-sale-review', params: { id } });
}
</script>

<template>
  <div data-testid="admin-sales-list">
    <PageHeader
      title="Gestión de ventas"
      subtitle="Cola de revisión según tu alcance administrativo."
    />

    <v-row dense class="altium-filters mb-4">
      <v-col cols="12" md="3">
        <v-text-field
          v-model="search"
          label="Buscar número o titular"
          prepend-inner-icon="mdi-magnify"
          clearable
          @click:clear="search = ''"
        />
      </v-col>
      <v-col cols="12" sm="6" md="2">
        <v-select
          v-model="statusFilter"
          :items="ADMIN_SALE_STATUS_OPTIONS"
          label="Estado"
          clearable
        />
      </v-col>
      <v-col cols="12" sm="6" md="2">
        <v-select
          v-model="customerTypeFilter"
          :items="CUSTOMER_TYPE_OPTIONS"
          label="Tipo de venta"
          clearable
        />
      </v-col>
      <v-col cols="12" sm="6" md="2">
        <v-select
          v-model="insurerFilter"
          :items="insurerItems"
          :loading="insurersQuery.isFetching.value"
          label="Prepaga"
          clearable
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-select
          v-model="planFilter"
          :items="planItems"
          :disabled="!insurerFilter"
          :loading="plansQuery.isFetching.value"
          label="Plan"
          clearable
        />
      </v-col>
      <v-col cols="12" sm="6" md="2">
        <v-text-field v-model="createdFrom" type="date" label="Creada desde" clearable />
      </v-col>
      <v-col cols="12" sm="6" md="2">
        <v-text-field v-model="createdTo" type="date" label="Creada hasta" clearable />
      </v-col>
    </v-row>

    <ErrorState
      v-if="loadError"
      :message="apiErrorMessage(loadError)"
      :request-id="isApiError(loadError) ? loadError.requestId : null"
      :loading="salesQuery.isFetching.value"
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
        class="altium-table"
        data-testid="admin-sales-table"
        @click:row="(_e: unknown, row: { item: SaleListItem }) => openReview(row.item.id)"
      >
        <template #[`item.saleNumber`]="{ item }">
          <span class="font-weight-medium">{{ formatSaleNumber(item.saleNumber) }}</span>
        </template>
        <template #[`item.holder`]="{ item }">
          <div>{{ holderLabel(item) }}</div>
          <div class="text-caption text-medium-emphasis">{{ item.holderCuilMasked ?? '' }}</div>
        </template>
        <template #[`item.seller`]="{ item }">{{ sellerLabel(item) }}</template>
        <template #[`item.customerType`]="{ item }">
          {{ customerTypeLabel(item.customerType) }}
        </template>
        <template #[`item.status`]="{ item }">
          <StatusBadge :status="item.status" />
        </template>
        <template #[`item.createdAt`]="{ item }">{{ formatDateTime(item.createdAt) }}</template>
        <template #[`item.submittedAt`]="{ item }">
          {{ item.submittedAt ? formatDateTime(item.submittedAt) : '—' }}
        </template>
        <template #[`item.actions`]="{ item }">
          <v-btn size="small" variant="text" @click.stop="openReview(item.id)">Revisar</v-btn>
        </template>
        <template #no-data>
          <EmptyState
            title="Sin ventas en cola"
            text="No hay operaciones que coincidan con los filtros."
          />
        </template>
      </v-data-table-server>
    </v-card>
  </div>
</template>
