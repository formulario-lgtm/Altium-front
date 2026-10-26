<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import EmptyState from '@/components/common/EmptyState.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { apiErrorMessage, isApiError, type AdministrativeListItem } from '@/services/http';
import SupervisionPeriodFilters from '../components/SupervisionPeriodFilters.vue';
import { useSupervisionAdministrativesQuery } from '../composables/useSupervision';
import { useSupervisionPeriod } from '../composables/useSupervisionPeriod';
import { formatHours, personName } from '../utils/supervision-labels';

const router = useRouter();
const { year, month, teamId, periodQuery } = useSupervisionPeriod();
const search = ref('');

const query = useSupervisionAdministrativesQuery(
  computed(() => ({ ...periodQuery.value, page: 1, pageSize: 100 })),
);

const items = computed(() => {
  const q = search.value.trim().toLowerCase();
  const rows = query.data.value?.items ?? [];
  if (!q) return rows;
  return rows.filter((row) =>
    `${row.firstName} ${row.lastName} ${row.teamName ?? ''}`.toLowerCase().includes(q),
  );
});

function openDetail(item: AdministrativeListItem): void {
  void router.push({
    name: 'supervision-administrative-detail',
    params: { id: item.administrativeUserId },
    query: {
      year: String(year.value),
      month: String(month.value),
      ...(teamId.value ? { teamId: teamId.value } : {}),
    },
  });
}
</script>

<template>
  <div data-testid="supervision-administratives">
    <PageHeader
      title="Administrativos"
      subtitle="Volumen de gestiones, tiempos de primera revisión y seguimientos. No es un ranking de calidad."
    />

    <SupervisionPeriodFilters v-model:year="year" v-model:month="month" v-model:team-id="teamId" />

    <v-row dense class="altium-filters mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          label="Buscar administrativo o equipo"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
        />
      </v-col>
    </v-row>

    <ErrorState
      v-if="query.error.value"
      :message="apiErrorMessage(query.error.value)"
      :request-id="isApiError(query.error.value) ? query.error.value.requestId : null"
      :loading="query.isFetching.value"
      @retry="query.refetch()"
    />

    <EmptyState
      v-else-if="!query.isLoading.value && items.length === 0"
      title="Sin administrativos"
      text="No hay administrativos activos en el alcance seleccionado."
    />

    <v-card v-else>
      <v-data-table
        :items="items"
        :loading="query.isFetching.value"
        :headers="[
          { title: 'Administrativo', key: 'name' },
          { title: 'Equipo', key: 'teamName' },
          { title: 'Revisiones iniciadas', key: 'reviewsStarted' },
          { title: '1ª revisión (prom.)', key: 'avgFirstReviewHours' },
          { title: 'Devoluciones', key: 'returnsPerformed' },
          { title: 'Seg. pendientes', key: 'followUpsPending' },
          { title: 'Seg. vencidos', key: 'followUpsOverdue' },
          { title: 'Carga actual', key: 'currentWorkload' },
          { title: '', key: 'actions', sortable: false, align: 'end' },
        ]"
        item-value="administrativeUserId"
        hover
      >
        <template #[`item.name`]="{ item }">
          {{ personName(item.firstName, item.lastName) }}
        </template>
        <template #[`item.teamName`]="{ item }">
          {{ item.teamName ?? '—' }}
        </template>
        <template #[`item.avgFirstReviewHours`]="{ item }">
          {{ formatHours(item.avgFirstReviewHours) }}
        </template>
        <template #[`item.actions`]="{ item }">
          <v-btn variant="text" size="small" @click="openDetail(item)">Ver</v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>
