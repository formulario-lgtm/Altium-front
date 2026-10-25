<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { apiErrorMessage, isApiError } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import HomeAlertList from '../components/HomeAlertList.vue';
import HomeChartCard from '../components/HomeChartCard.vue';
import HomeFollowUpList from '../components/HomeFollowUpList.vue';
import HomeKpiGrid from '../components/HomeKpiGrid.vue';
import HomeQuickActions from '../components/HomeQuickActions.vue';
import HomeSaleList from '../components/HomeSaleList.vue';
import HomeSection from '../components/HomeSection.vue';
import { useAdministrativeHomeQuery } from '../composables/useHome';
import { useHomePeriod } from '../composables/useHomePeriod';
import { buildActivityBarOption, paletteFromTheme, seriesHasData } from '../utils/home-charts';
import { periodLabel } from '../utils/home-labels';
import {
  ADMINISTRATIVE_QUICK_ACTIONS,
  administrativeKpiRoute,
  alertRoute,
} from '../utils/home-navigation';

const auth = useAuthStore();
const theme = useTheme();
const { year, month, periodQuery } = useHomePeriod({ allowPastMonths: false, syncRoute: false });
const homeQuery = useAdministrativeHomeQuery(periodQuery);

const greeting = computed(() => `Hola, ${auth.user?.firstName ?? ''}`.trim());
const periodText = computed(() => periodLabel(year.value, month.value));

const chartOption = computed(() => {
  const series = homeQuery.data.value?.activityLast7Days ?? [];
  if (!seriesHasData(series)) return null;
  return buildActivityBarOption(
    series,
    paletteFromTheme(theme.global.current.value.dark),
    'Acciones (revisiones + seguimientos + observaciones)',
  );
});

const hasChartData = computed(() => seriesHasData(homeQuery.data.value?.activityLast7Days));
</script>

<template>
  <div data-testid="administrative-home">
    <PageHeader :title="greeting" :subtitle="`Prioridades operativas · ${periodText}`">
      <template #actions>
        <HomeQuickActions inline :actions="ADMINISTRATIVE_QUICK_ACTIONS" />
      </template>
    </PageHeader>

    <ErrorState
      v-if="homeQuery.error.value"
      :message="apiErrorMessage(homeQuery.error.value)"
      :request-id="isApiError(homeQuery.error.value) ? homeQuery.error.value.requestId : null"
      :loading="homeQuery.isFetching.value"
      @retry="homeQuery.refetch()"
    />

    <template v-else-if="homeQuery.data.value">
      <HomeKpiGrid :kpis="homeQuery.data.value.kpis" :resolve-route="administrativeKpiRoute" />

      <v-row dense class="home-panels">
        <v-col cols="12" md="7" class="d-flex">
          <HomeSection
            title="Prioridades de hoy"
            subtitle="Cola ordenada por relevancia en tu alcance."
          >
            <v-card class="home-panel-card">
              <v-card-text>
                <HomeSaleList
                  :sales="homeQuery.data.value.attentionQueue"
                  review-mode
                  empty-title="Cola vacía"
                  empty-text="No hay operaciones que requieran intervención inmediata."
                />
              </v-card-text>
            </v-card>
          </HomeSection>
        </v-col>
        <v-col cols="12" md="5" class="d-flex">
          <HomeSection title="Alertas" subtitle="Pendientes operativos en tu alcance.">
            <v-card class="home-panel-card">
              <v-card-text>
                <HomeAlertList
                  :alerts="homeQuery.data.value.alerts"
                  :resolve-route="(a) => alertRoute(a, 'administrative')"
                />
              </v-card-text>
            </v-card>
          </HomeSection>
        </v-col>
      </v-row>

      <HomeSection title="Actividad de los últimos 7 días">
        <HomeChartCard
          title="Acciones registradas"
          subtitle="Revisiones iniciadas, seguimientos y observaciones (consolidado)."
          :option="chartOption"
          :has-data="hasChartData"
          empty-text="Sin actividad registrada en la última semana."
        />
      </HomeSection>

      <HomeSection title="Próximos seguimientos">
        <v-card>
          <v-card-text>
            <HomeFollowUpList :items="homeQuery.data.value.upcomingFollowUps" />
          </v-card-text>
        </v-card>
      </HomeSection>
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
