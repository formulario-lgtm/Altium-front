<script setup lang="ts">
import { computed } from 'vue';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { apiErrorMessage, isApiError } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import HomeKpiGrid from '../components/HomeKpiGrid.vue';
import HomePeriodFilters from '../components/HomePeriodFilters.vue';
import HomeQuickActions from '../components/HomeQuickActions.vue';
import SupervisorSellersPanel from '../components/SupervisorSellersPanel.vue';
import SupervisorAdministrativesPanel from '../components/SupervisorAdministrativesPanel.vue';
import { useSupervisorHomeQuery } from '../composables/useHome';
import { useHomePeriod } from '../composables/useHomePeriod';
import { periodLabel } from '../utils/home-labels';
import { SUPERVISOR_QUICK_ACTIONS } from '../utils/home-navigation';
const auth = useAuthStore();
const { year, month, teamId, periodQuery } = useHomePeriod({
  allowPastMonths: true,
  syncRoute: true,
  enableTeam: true,
});
const homeQuery = useSupervisorHomeQuery(periodQuery);
const greeting = computed(() => `Hola, ${auth.user?.firstName ?? ''}`.trim());
const periodText = computed(() => periodLabel(year.value, month.value));
</script>
<template>
  <div data-testid="supervisor-home">
    <PageHeader :title="greeting" :subtitle="`Resumen mensual de tus equipos · ${periodText}`">
      <template #actions
        ><HomeQuickActions inline :actions="SUPERVISOR_QUICK_ACTIONS" :period="periodQuery"
      /></template>
    </PageHeader>
    <HomePeriodFilters
      v-model:year="year"
      v-model:month="month"
      v-model:team-id="teamId"
      show-team
    />
    <ErrorState
      v-if="homeQuery.error.value"
      :message="apiErrorMessage(homeQuery.error.value)"
      :request-id="isApiError(homeQuery.error.value) ? homeQuery.error.value.requestId : null"
      :loading="homeQuery.isFetching.value"
      @retry="homeQuery.refetch()"
    />
    <template v-else-if="homeQuery.data.value">
      <HomeKpiGrid :kpis="homeQuery.data.value.kpis" compact-mobile class="mb-4" />
      <v-row class="align-stretch"
        ><v-col cols="12" lg="6" class="d-flex" style="min-width: 0"
          ><SupervisorSellersPanel :home="homeQuery.data.value" :period="periodQuery" /></v-col
        ><v-col cols="12" lg="6" class="d-flex" style="min-width: 0"
          ><SupervisorAdministrativesPanel
            :home="homeQuery.data.value"
            :period="periodQuery" /></v-col
      ></v-row>
      <v-card class="pa-4 mt-5" data-testid="supervisor-current-workload">
        <h2 class="text-subtitle-1 mb-2">Pendientes actuales</h2>
        <div class="d-flex flex-wrap ga-2">
          <v-chip
            >{{ homeQuery.data.value.administrativeTotals.currentWorkload }} ventas asignadas por
            gestionar</v-chip
          ><v-chip>{{ homeQuery.data.value.unassigned }} sin responsable asignado</v-chip
          ><v-chip :color="homeQuery.data.value.followUpsOverdue ? 'warning' : undefined"
            >{{ homeQuery.data.value.followUpsOverdue }} seguimientos vencidos</v-chip
          >
        </div>
        <p class="text-caption text-medium-emphasis mt-2 mb-0">
          Carga actual de tus equipos, incluidas ventas de meses anteriores. Los seguimientos
          corresponden a trámites de ventas.
        </p>
      </v-card>
    </template>
    <v-skeleton-loader v-else-if="homeQuery.isLoading.value" type="article, article" />
  </div>
</template>
