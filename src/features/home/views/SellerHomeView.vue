<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { apiErrorMessage, isApiError } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import HomeAlertList from '../components/HomeAlertList.vue';
import HomeChartCard from '../components/HomeChartCard.vue';
import HomeKpiGrid from '../components/HomeKpiGrid.vue';
import HomeQuickActions from '../components/HomeQuickActions.vue';
import HomeSaleList from '../components/HomeSaleList.vue';
import HomeSection from '../components/HomeSection.vue';
import { useSellerHomeQuery } from '../composables/useHome';
import { useHomePeriod } from '../composables/useHomePeriod';
import { buildPresentedLineOption, paletteFromTheme, seriesHasData } from '../utils/home-charts';
import { periodLabel } from '../utils/home-labels';
import {
  alertRoute,
  sellerKpiRoute,
  sellerOperationalAlerts,
  SELLER_QUICK_ACTIONS,
} from '../utils/home-navigation';

const auth = useAuthStore();
const theme = useTheme();
const { year, month, periodQuery } = useHomePeriod({ allowPastMonths: false, syncRoute: false });
const homeQuery = useSellerHomeQuery(periodQuery);

const greeting = computed(() => `Hola, ${auth.user?.firstName ?? ''}`.trim());
const periodText = computed(() => periodLabel(year.value, month.value));

const chartOption = computed(() => {
  const series = homeQuery.data.value?.dailyPresented ?? [];
  if (!seriesHasData(series)) return null;
  const target = homeQuery.data.value?.compliance.hasGoal
    ? homeQuery.data.value.compliance.targetValue
    : null;
  return buildPresentedLineOption(series, paletteFromTheme(theme.global.current.value.dark), {
    target,
    seriesName: 'Presentadas',
    periodLabel: periodText.value,
  });
});

const hasChartData = computed(() => seriesHasData(homeQuery.data.value?.dailyPresented));
const operationalAlerts = computed(() =>
  sellerOperationalAlerts(homeQuery.data.value?.alerts ?? []),
);
</script>

<template>
  <div data-testid="seller-home">
    <PageHeader :title="greeting" :subtitle="`Resumen de tus ventas · ${periodText}`">
      <template #actions>
        <HomeQuickActions inline :actions="SELLER_QUICK_ACTIONS" />
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
      <HomeKpiGrid :kpis="homeQuery.data.value.kpis" :resolve-route="sellerKpiRoute" />

      <v-row dense class="home-panels">
        <v-col cols="12" md="6" class="d-flex">
          <HomeSection
            title="Requiere tu atención"
            subtitle="Devueltas con observaciones pendientes."
          >
            <v-card class="home-panel-card">
              <v-card-text>
                <HomeSaleList
                  :sales="homeQuery.data.value.returnedNeedingCorrection"
                  empty-title="Nada pendiente"
                  empty-text="No tenés ventas devueltas por corregir."
                />
              </v-card-text>
            </v-card>
          </HomeSection>
        </v-col>
        <v-col cols="12" md="6" class="d-flex">
          <HomeSection
            title="Alertas"
            subtitle="Correcciones y movimientos que requieren seguimiento."
          >
            <v-card class="home-panel-card">
              <v-card-text>
                <HomeAlertList
                  :alerts="operationalAlerts"
                  empty-title="Sin alertas operativas"
                  empty-text="No hay devoluciones ni correcciones pendientes. El cumplimiento se ve en los indicadores de arriba."
                  :resolve-route="(a) => alertRoute(a, 'seller')"
                />
              </v-card-text>
            </v-card>
          </HomeSection>
        </v-col>
      </v-row>

      <HomeSection :title="`Evolución · ${periodText}`">
        <HomeChartCard
          title="Ventas presentadas"
          :subtitle="
            homeQuery.data.value.compliance.hasGoal
              ? `Objetivo mensual: ${homeQuery.data.value.compliance.targetValue ?? '—'}`
              : 'Sin objetivo mensual configurado'
          "
          :option="chartOption"
          :has-data="hasChartData"
          empty-text="Todavía no hay presentaciones en el mes."
        />
      </HomeSection>

      <HomeSection title="Actividad reciente">
        <v-card>
          <v-card-text>
            <HomeSaleList
              :sales="homeQuery.data.value.recentSales"
              empty-title="Sin actividad"
              empty-text="Todavía no registraste operaciones."
            />
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
