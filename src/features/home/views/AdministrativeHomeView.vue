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
import HomePanel from '../components/HomePanel.vue';
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
    'Acciones',
  );
});

const hasChartData = computed(() => seriesHasData(homeQuery.data.value?.activityLast7Days));
const operationalAlerts = computed(() => {
  const home = homeQuery.data.value;
  return (home?.alerts ?? []).filter(
    (alert) =>
      !(
        alert.code === 'PENDING_REVIEW' &&
        home?.attentionQueue.some((sale) => sale.status === 'SUBMITTED')
      ) &&
      !(
        alert.code === 'RETURNED_STOCK' &&
        home?.attentionQueue.some((sale) => sale.status === 'RETURNED')
      ),
  );
});
</script>

<template>
  <div data-testid="administrative-home">
    <PageHeader :title="greeting" :subtitle="`Prioridades operativas · ${periodText}`">
      <template #actions>
        <HomeQuickActions
          inline
          primary-key="admin-sales"
          :actions="ADMINISTRATIVE_QUICK_ACTIONS"
        />
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
      <HomeKpiGrid
        :kpis="homeQuery.data.value.kpis"
        :resolve-route="administrativeKpiRoute"
        compact-mobile
      />

      <div class="d-flex flex-wrap ga-2 mt-3 mb-5" aria-label="Resumen de actividad">
        <v-chip variant="tonal"
          >{{ homeQuery.data.value.presentedToday }} ventas presentadas hoy</v-chip
        >
        <v-chip variant="tonal"
          >{{ homeQuery.data.value.reviewsStartedToday }} revisiones iniciadas hoy</v-chip
        >
        <v-chip variant="tonal"
          >{{ homeQuery.data.value.actionsThisMonth }} acciones este mes</v-chip
        >
      </div>

      <v-row class="mb-3">
        <v-col cols="12" lg="7" class="d-flex">
          <HomePanel
            title="Prioridades de hoy"
            subtitle="Abrí una venta para revisar su información y continuar la gestión."
            data-testid="administrative-priorities"
          >
            <template #actions
              ><v-btn
                v-if="auth.hasPermission('sales.review')"
                :to="{ name: 'admin-sales' }"
                variant="text"
                color="primary"
                size="small"
                append-icon="mdi-arrow-right"
                >Ver cola</v-btn
              ></template
            >
            <HomeSaleList
              :sales="homeQuery.data.value.attentionQueue"
              review-mode
              show-action
              empty-title="Tu cola está al día"
              empty-text="No hay ventas que necesiten una revisión inmediata."
            />
          </HomePanel>
        </v-col>
        <v-col cols="12" lg="5" class="d-flex">
          <HomePanel
            title="Próximos seguimientos"
            subtitle="Compromisos y gestiones para retomar."
            data-testid="administrative-follow-ups"
          >
            <template #actions
              ><v-btn
                v-if="auth.hasPermission('sales.follow_up')"
                :to="{ name: 'admin-follow-ups' }"
                variant="text"
                color="primary"
                size="small"
                append-icon="mdi-arrow-right"
                >Ver agenda</v-btn
              ></template
            >
            <HomeFollowUpList :items="homeQuery.data.value.upcomingFollowUps" />
          </HomePanel>
        </v-col>
      </v-row>

      <v-alert
        v-if="homeQuery.data.value.alerts.length === 0"
        type="success"
        variant="tonal"
        class="mb-6"
        title="Sin alertas operativas"
        text="No hay avisos adicionales que requieran tu atención."
      />
      <v-row>
        <v-col cols="12" :lg="operationalAlerts.length ? 7 : 12" class="d-flex">
          <HomeChartCard
            title="Tu actividad de los últimos 7 días"
            subtitle="Revisiones iniciadas, seguimientos y observaciones (consolidado)."
            :option="chartOption"
            :has-data="hasChartData"
            height="220px"
            empty-text="Sin actividad registrada en la última semana."
          />
        </v-col>
        <v-col v-if="operationalAlerts.length" cols="12" lg="5" class="d-flex">
          <HomePanel
            title="Pendientes operativos"
            subtitle="Resumen de avisos dentro de tu alcance."
          >
            <HomeAlertList
              :alerts="operationalAlerts"
              :resolve-route="(a) => alertRoute(a, 'administrative')"
            />
          </HomePanel>
        </v-col>
      </v-row>
    </template>

    <v-skeleton-loader v-else-if="homeQuery.isLoading.value" type="article, article" />
  </div>
</template>
