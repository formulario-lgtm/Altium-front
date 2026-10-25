<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { apiErrorMessage, isApiError } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import { formatHomeCompliance, periodLabel } from '../utils/home-labels';
import {
  buildComplianceBySellerOption,
  buildPresentedLineOption,
  paletteFromTheme,
  seriesHasData,
} from '../utils/home-charts';
import { alertRoute, SUPERVISOR_QUICK_ACTIONS, supervisorKpiRoute } from '../utils/home-navigation';
import HomeAlertList from '../components/HomeAlertList.vue';
import HomeChartCard from '../components/HomeChartCard.vue';
import HomeKpiGrid from '../components/HomeKpiGrid.vue';
import HomePeriodFilters from '../components/HomePeriodFilters.vue';
import HomeQuickActions from '../components/HomeQuickActions.vue';
import HomeSection from '../components/HomeSection.vue';
import { useSupervisorHomeQuery } from '../composables/useHome';
import { useHomePeriod } from '../composables/useHomePeriod';
import { useSupervisionSellersQuery } from '@/features/supervision/composables/useSupervision';
import { personName } from '@/features/supervision/utils/supervision-labels';

const auth = useAuthStore();
const theme = useTheme();
const router = useRouter();
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

const presentedOption = computed(() => {
  const series = homeQuery.data.value?.dailyPresented ?? [];
  if (!seriesHasData(series)) return null;
  const target = homeQuery.data.value?.compliance.hasGoal
    ? homeQuery.data.value.compliance.targetValue
    : null;
  return buildPresentedLineOption(series, palette.value, {
    target,
    seriesName: 'Presentadas',
    periodLabel: periodText.value,
  });
});

const complianceOption = computed(() => {
  const withGoal = (sellersQuery.data.value?.items ?? []).filter(
    (s) => s.compliance.hasGoal && !s.compliance.targetIsZero,
  );
  if (withGoal.length === 0) return null;
  return buildComplianceBySellerOption(
    withGoal.map((s) => ({
      firstName: s.firstName,
      lastName: s.lastName,
      compliancePercent: s.compliance.compliancePercent,
    })),
    palette.value,
  );
});

const hasPresentedData = computed(() => seriesHasData(homeQuery.data.value?.dailyPresented));
const hasComplianceData = computed(
  () =>
    (sellersQuery.data.value?.items ?? []).filter(
      (s) => s.compliance.hasGoal && !s.compliance.targetIsZero,
    ).length > 0,
);

function openSeller(sellerId: string): void {
  void router.push({
    name: 'supervision-seller-detail',
    params: { id: sellerId },
    query: { year: String(year.value), month: String(month.value) },
  });
}
</script>

<template>
  <div data-testid="supervisor-home">
    <PageHeader :title="greeting" :subtitle="`Supervisión de equipos · ${periodText}`">
      <template #actions>
        <HomeQuickActions inline :actions="SUPERVISOR_QUICK_ACTIONS" />
      </template>
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
      <HomeKpiGrid :kpis="homeQuery.data.value.kpis" :resolve-route="supervisorKpiRoute" />

      <v-row dense class="home-panels">
        <v-col cols="12" md="6" class="d-flex">
          <HomeSection title="Alertas" subtitle="Riesgos del alcance de supervisión.">
            <v-card class="home-panel-card">
              <v-card-text>
                <HomeAlertList
                  :alerts="homeQuery.data.value.alerts"
                  :resolve-route="(a) => alertRoute(a, 'supervisor')"
                />
              </v-card-text>
            </v-card>
          </HomeSection>
        </v-col>
        <v-col cols="12" md="6" class="d-flex">
          <HomeSection
            title="Vendedores bajo ritmo"
            :subtitle="`Esperado ≥ ${Math.round(homeQuery.data.value.expectedPercent)}% del mes`"
          >
            <v-card class="home-panel-card">
              <v-card-text>
                <v-list
                  v-if="homeQuery.data.value.sellersBehindPace.length > 0"
                  lines="two"
                  class="bg-transparent pa-0"
                >
                  <v-list-item
                    v-for="seller in homeQuery.data.value.sellersBehindPace"
                    :key="seller.sellerId"
                    role="link"
                    tabindex="0"
                    @click="openSeller(seller.sellerId)"
                    @keydown.enter="openSeller(seller.sellerId)"
                  >
                    <v-list-item-title>
                      {{ personName(seller.firstName, seller.lastName) }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ seller.salesPresented }} presentadas ·
                      {{ formatHomeCompliance(seller.compliance) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
                <p v-else class="text-body-2 text-medium-emphasis mb-0">
                  Todos los vendedores con objetivo están al ritmo esperado.
                </p>
              </v-card-text>
            </v-card>
          </HomeSection>
        </v-col>
      </v-row>

      <v-row dense class="mb-6 home-panels">
        <v-col cols="12" md="6" class="d-flex">
          <HomeChartCard
            :title="`Evolución · ${periodText}`"
            subtitle="Presentaciones diarias vs objetivo del mes"
            :option="presentedOption"
            :has-data="hasPresentedData"
          />
        </v-col>
        <v-col cols="12" md="6" class="d-flex">
          <HomeChartCard
            title="Cumplimiento por vendedor"
            subtitle="Solo vendedores con objetivo usable en el período"
            :option="complianceOption"
            :has-data="hasComplianceData"
            empty-text="No hay vendedores con objetivo en este período."
          />
        </v-col>
      </v-row>
    </template>

    <v-skeleton-loader v-else-if="homeQuery.isLoading.value" type="article, article" />
  </div>
</template>

<style scoped lang="scss">
.home-panels {
  align-items: stretch;
}

.home-panel-card {
  flex: 1 1 auto;
  min-height: 220px;
}
</style>
