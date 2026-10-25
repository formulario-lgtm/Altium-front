<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import EmptyState from '@/components/common/EmptyState.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { apiErrorMessage, isApiError, type SellerListItem } from '@/services/http';
import ComplianceChip from '../components/ComplianceChip.vue';
import SupervisionPeriodFilters from '../components/SupervisionPeriodFilters.vue';
import { useSupervisionSellersQuery } from '../composables/useSupervision';
import { useSupervisionPeriod } from '../composables/useSupervisionPeriod';
import { formatDateTime } from '@/utils/format';
import { formatPercent, personName } from '../utils/supervision-labels';

const router = useRouter();
const { year, month, teamId, periodQuery } = useSupervisionPeriod();
const search = ref('');

const sellersQuery = useSupervisionSellersQuery(
  computed(() => ({ ...periodQuery.value, page: 1, pageSize: 100 })),
);

const items = computed(() => {
  const q = search.value.trim().toLowerCase();
  const rows = sellersQuery.data.value?.items ?? [];
  if (!q) return rows;
  return rows.filter((row) =>
    `${row.firstName} ${row.lastName} ${row.teamName ?? ''}`.toLowerCase().includes(q),
  );
});

function openDetail(item: SellerListItem): void {
  void router.push({
    name: 'supervision-seller-detail',
    params: { id: item.sellerId },
    query: {
      year: String(year.value),
      month: String(month.value),
      ...(teamId.value ? { teamId: teamId.value } : {}),
    },
  });
}

function formatActivity(value: string | null): string {
  return formatDateTime(value);
}
</script>

<template>
  <div data-testid="supervision-sellers">
    <PageHeader
      title="Vendedores"
      subtitle="Comparativa de presentaciones, objetivos y devoluciones del período."
    />

    <SupervisionPeriodFilters v-model:year="year" v-model:month="month" v-model:team-id="teamId" />

    <v-row dense class="altium-filters mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          label="Buscar vendedor o equipo"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
        />
      </v-col>
    </v-row>

    <ErrorState
      v-if="sellersQuery.error.value"
      :message="apiErrorMessage(sellersQuery.error.value)"
      :request-id="isApiError(sellersQuery.error.value) ? sellersQuery.error.value.requestId : null"
      :loading="sellersQuery.isFetching.value"
      @retry="sellersQuery.refetch()"
    />

    <EmptyState
      v-else-if="!sellersQuery.isLoading.value && items.length === 0"
      title="Sin vendedores"
      text="No hay vendedores activos en el alcance seleccionado."
    />

    <v-card v-else>
      <v-data-table
        :items="items"
        :loading="sellersQuery.isFetching.value"
        :headers="[
          { title: 'Vendedor', key: 'name', sortable: true },
          { title: 'Equipo', key: 'teamName' },
          { title: 'Presentadas', key: 'salesPresented' },
          { title: 'Objetivo', key: 'target' },
          { title: 'Cumplimiento', key: 'compliance' },
          { title: 'Devueltas', key: 'returnedStock' },
          { title: 'Tasa devolución', key: 'returnRate' },
          { title: 'Última actividad', key: 'lastActivityAt' },
          { title: '', key: 'actions', sortable: false, align: 'end' },
        ]"
        item-value="sellerId"
        hover
      >
        <template #[`item.name`]="{ item }">
          {{ personName(item.firstName, item.lastName) }}
        </template>
        <template #[`item.teamName`]="{ item }">
          {{ item.teamName ?? '—' }}
        </template>
        <template #[`item.target`]="{ item }">
          {{
            item.compliance.hasGoal
              ? item.compliance.targetIsZero
                ? '0'
                : (item.compliance.targetValue ?? '—')
              : 'Sin objetivo'
          }}
        </template>
        <template #[`item.compliance`]="{ item }">
          <ComplianceChip :compliance="item.compliance" />
        </template>
        <template #[`item.returnRate`]="{ item }">
          {{ formatPercent(item.returnRate.ratePercent) }}
          <span class="text-caption text-medium-emphasis">
            ({{ item.returnRate.returnedAmongPresented }}/{{ item.returnRate.presented }})
          </span>
        </template>
        <template #[`item.lastActivityAt`]="{ item }">
          {{ formatActivity(item.lastActivityAt) }}
        </template>
        <template #[`item.actions`]="{ item }">
          <v-btn variant="text" size="small" @click="openDetail(item)">Ver</v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>
