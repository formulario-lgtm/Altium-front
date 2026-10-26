<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { apiErrorMessage, isApiError } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import HomeAlertList from '../components/HomeAlertList.vue';
import HomeChartCard from '../components/HomeChartCard.vue';
import HomeGoalProgress from '../components/HomeGoalProgress.vue';
import HomeKpiGrid from '../components/HomeKpiGrid.vue';
import HomePanel from '../components/HomePanel.vue';
import HomePeriodFilters from '../components/HomePeriodFilters.vue';
import HomeQuickActions from '../components/HomeQuickActions.vue';
import HomeSellerPaceList from '../components/HomeSellerPaceList.vue';
import { useSupervisorHomeQuery } from '../composables/useHome';
import { useHomePeriod } from '../composables/useHomePeriod';
import {
  buildComplianceBySellerOption,
  buildDailyCountOption,
  paletteFromTheme,
  seriesHasData,
} from '../utils/home-charts';
import { periodLabel } from '../utils/home-labels';
import {
  alertRoute,
  SUPERVISOR_QUICK_ACTIONS,
  supervisorKpiRoute,
  withHomePeriod,
} from '../utils/home-navigation';
import { useSupervisionSellersQuery } from '@/features/supervision/composables/useSupervision';

const auth = useAuthStore();
const theme = useTheme();
const { year, month, teamId, periodQuery } = useHomePeriod({
  allowPastMonths: true,
  syncRoute: true,
  enableTeam: true,
});
const homeQuery = useSupervisorHomeQuery(periodQuery);
const sellersQuery = useSupervisionSellersQuery(
  computed(() => ({ ...periodQuery.value, page: 1, pageSize: 100 })),
);
const greeting = computed(() => `Hola, ${auth.user?.firstName ?? ''}`.trim());
const periodText = computed(() => periodLabel(year.value, month.value));
const palette = computed(() => paletteFromTheme(theme.global.current.value.dark));
const hasPresentedData = computed(() => seriesHasData(homeQuery.data.value?.dailyPresented));
const presentedOption = computed(() =>
  hasPresentedData.value
    ? buildDailyCountOption(homeQuery.data.value?.dailyPresented ?? [], palette.value)
    : null,
);
const comparableSellers = computed(() =>
  (sellersQuery.data.value?.items ?? [])
    .filter(
      (seller) =>
        seller.compliance.hasGoal &&
        !seller.compliance.targetIsZero &&
        seller.compliance.compliancePercent != null,
    )
    .sort((a, b) => (a.compliance.compliancePercent ?? 0) - (b.compliance.compliancePercent ?? 0)),
);
const complianceOption = computed(() =>
  comparableSellers.value.length
    ? buildComplianceBySellerOption(
        comparableSellers.value.map((seller) => ({
          firstName: seller.firstName,
          lastName: seller.lastName,
          compliancePercent: seller.compliance.compliancePercent,
        })),
        palette.value,
      )
    : null,
);
const operationalAlerts = computed(() =>
  (homeQuery.data.value?.alerts ?? []).filter(
    (alert) =>
      alert.code !== 'NO_GOAL' &&
      !(alert.code === 'BEHIND_PACE' && (homeQuery.data.value?.sellersBehindPace.length ?? 0) > 0),
  ),
);
</script>

<template>
  <div data-testid="supervisor-home">
    <PageHeader :title="greeting" :subtitle="`El avance de tus equipos · ${periodText}`">
      <template #actions
        ><HomeQuickActions
          inline
          primary-key="sellers"
          :actions="SUPERVISOR_QUICK_ACTIONS"
          :period="periodQuery"
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
      <HomeKpiGrid
        :kpis="homeQuery.data.value.kpis"
        :resolve-route="(code) => withHomePeriod(supervisorKpiRoute(code), periodQuery)"
        compact-mobile
        class="mb-5"
      />
      <v-row class="mb-3">
        <v-col cols="12" lg="7" class="d-flex">
          <HomePanel
            title="Vendedores bajo ritmo"
            :subtitle="`Avance esperado del período: ${Math.round(homeQuery.data.value.expectedPercent)}%. Abrí un vendedor para identificar cómo acompañarlo.`"
            data-testid="supervisor-priorities"
          >
            <template #actions
              ><v-btn
                v-if="auth.hasPermission('supervision.analytics.read')"
                :to="withHomePeriod({ name: 'supervision-sellers' }, periodQuery) ?? undefined"
                variant="text"
                color="primary"
                size="small"
                append-icon="mdi-arrow-right"
                >Ver todos</v-btn
              ></template
            >
            <HomeSellerPaceList
              :sellers="homeQuery.data.value.sellersBehindPace"
              :period="periodQuery"
            />
          </HomePanel>
        </v-col>
        <v-col cols="12" lg="5" class="d-flex">
          <HomeChartCard
            title="Avance del equipo"
            :subtitle="periodText"
            :option="presentedOption"
            :has-data="hasPresentedData"
            height="200px"
            empty-text="Todavía no hay ventas presentadas en este período."
            data-testid="supervisor-progress"
          >
            <template #actions
              ><v-btn
                v-if="auth.hasPermission('supervision.analytics.read')"
                :to="withHomePeriod({ name: 'supervision-goals' }, periodQuery) ?? undefined"
                variant="text"
                color="primary"
                size="small"
                >Ver objetivos</v-btn
              ></template
            >
            <template #summary
              ><HomeGoalProgress
                :compliance="homeQuery.data.value.compliance"
                label="Objetivo del equipo"
              />
              <h3 class="text-subtitle-2 mb-1">Presentadas por día</h3></template
            >
          </HomeChartCard>
        </v-col>
      </v-row>
      <HomePanel
        v-if="operationalAlerts.length"
        title="Otros asuntos por atender"
        subtitle="Avisos de tus equipos que necesitan seguimiento."
        class="mb-6"
      >
        <HomeAlertList
          :alerts="operationalAlerts"
          :resolve-route="(alert) => withHomePeriod(alertRoute(alert, 'supervisor'), periodQuery)"
        />
      </HomePanel>
      <HomePanel v-if="sellersQuery.error.value" title="Cumplimiento por vendedor">
        <ErrorState
          :message="apiErrorMessage(sellersQuery.error.value)"
          :loading="sellersQuery.isFetching.value"
          @retry="sellersQuery.refetch()"
        />
      </HomePanel>
      <HomeChartCard
        v-else
        title="Cumplimiento por vendedor"
        subtitle="De menor a mayor avance · Solo vendedores con objetivo y cumplimiento disponible."
        :option="complianceOption"
        :has-data="comparableSellers.length > 0"
        :loading="sellersQuery.isLoading.value"
        :height="`${Math.max(200, Math.min(12, comparableSellers.length) * 36 + 48)}px`"
        empty-text="No hay vendedores con un objetivo y cumplimiento disponible para comparar."
      />
    </template>
    <v-skeleton-loader v-else-if="homeQuery.isLoading.value" type="article, article" />
  </div>
</template>
