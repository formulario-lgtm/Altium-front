<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
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
import { useAuthStore } from '@/stores/auth.store';
import { formatDateTime } from '@/utils/format';
import {
  useHealthInsurersQuery,
  useHealthPlansQuery,
  useSalesQuery,
} from '../composables/useSales';
import {
  canEditSaleStatus,
  CUSTOMER_TYPE_OPTIONS,
  customerTypeLabel,
  SALE_STATUS_OPTIONS,
} from '../utils/sale-labels';
import { saleListSearchParams } from '../utils/sale-search';

const auth = useAuthStore();
const router = useRouter();
const canCreate = computed(() => auth.hasPermission('sales.create'));
/** Backend gates both edit and present with `sales.update` (no separate submit permission). */
const canUpdate = computed(() => auth.hasPermission('sales.update'));
const canSubmit = canUpdate;

const page = ref(1);
const itemsPerPage = ref(25);
const search = ref('');
const debouncedSearch = useDebouncedRef(search);
const statusFilter = ref<SaleStatus | null>(null);
const customerTypeFilter = ref<SaleCustomerType | null>(null);
const insurerFilter = ref<string | null>(null);
const planFilter = ref<string | null>(null);
const createdFrom = ref<string | null>(null);
const createdTo = ref<string | null>(null);

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

const insurersQuery = useHealthInsurersQuery();
const plansQuery = useHealthPlansQuery(insurerFilter);

const listQuery = computed<SaleListQuery>(() => {
  const query: SaleListQuery = {
    limit: itemsPerPage.value,
    offset: (page.value - 1) * itemsPerPage.value,
    sortBy: 'updatedAt',
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
  { title: 'Prepaga', key: 'healthInsurerName', sortable: false },
  { title: 'Plan', key: 'healthPlanName', sortable: false },
  { title: 'Tipo', key: 'customerType', sortable: false },
  { title: 'Fecha', key: 'date', sortable: false },
  { title: 'Estado', key: 'status', sortable: false },
  { title: 'Última modificación', key: 'updatedAt', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' as const },
];

function holderLabel(item: SaleListItem): string {
  const name = [item.holderLastName, item.holderFirstName].filter(Boolean).join(', ');
  return name || 'Sin titular';
}

function openDetail(id: string): void {
  void router.push({ name: 'sale-detail', params: { id } });
}

function openEdit(id: string): void {
  void router.push({ name: 'sale-edit', params: { id } });
}
</script>

<template>
  <div>
    <PageHeader title="Mis ventas" subtitle="Borradores y ventas presentadas.">
      <template v-if="canCreate" #actions>
        <v-btn color="primary" prepend-icon="mdi-plus" :to="{ name: 'sale-new' }"
          >Nueva venta</v-btn
        >
      </template>
    </PageHeader>

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
        <v-select v-model="statusFilter" :items="SALE_STATUS_OPTIONS" label="Estado" clearable />
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
        <v-text-field v-model="createdFrom" type="date" label="Desde" clearable />
      </v-col>
      <v-col cols="12" sm="6" md="2">
        <v-text-field v-model="createdTo" type="date" label="Hasta" clearable />
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
        :items-per-page-options="[10, 25, 50, 100]"
        item-value="id"
        loading-text="Cargando ventas…"
        class="altium-clickable-rows"
        data-testid="sales-table"
        @click:row="(_e: unknown, row: { item: SaleListItem }) => openDetail(row.item.id)"
      >
        <template #[`item.saleNumber`]="{ item }">
          <span class="font-weight-medium">{{ item.saleNumber }}</span>
        </template>
        <template #[`item.holder`]="{ item }">
          <div>{{ holderLabel(item) }}</div>
          <div v-if="item.holderCuilMasked" class="text-medium-emphasis text-caption">
            {{ item.holderCuilMasked }}
          </div>
        </template>
        <template #[`item.healthPlanName`]="{ item }">{{ item.healthPlanName ?? '—' }}</template>
        <template #[`item.customerType`]="{ item }">
          {{ customerTypeLabel(item.customerType) }}
        </template>
        <template #[`item.date`]="{ item }">
          {{ item.submittedAt ? formatDateTime(item.submittedAt) : '—' }}
        </template>
        <template #[`item.status`]="{ item }">
          <StatusBadge :status="item.status" />
        </template>
        <template #[`item.updatedAt`]="{ item }">{{ formatDateTime(item.updatedAt) }}</template>
        <template #[`item.actions`]="{ item }">
          <div class="d-flex justify-end ga-1" @click.stop>
            <v-btn
              size="small"
              variant="text"
              aria-label="Ver detalle"
              @click="openDetail(item.id)"
            >
              Ver
            </v-btn>
            <v-btn
              v-if="canUpdate && canEditSaleStatus(item.status)"
              size="small"
              variant="text"
              color="primary"
              @click="openEdit(item.id)"
            >
              Editar
            </v-btn>
            <v-btn
              v-if="canSubmit && canEditSaleStatus(item.status)"
              size="small"
              variant="text"
              color="primary"
              @click="openEdit(item.id)"
            >
              Presentar
            </v-btn>
          </div>
        </template>
        <template #no-data>
          <EmptyState
            title="No hay ventas"
            text="Creá una nueva venta o ajustá los filtros."
            icon="mdi-file-document-outline"
          />
        </template>
      </v-data-table-server>
    </v-card>
  </div>
</template>
