<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import type { EChartsCoreOption } from 'echarts/core';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { apiErrorMessage, isApiError } from '@/services/http';
import AltiumChart from '../components/AltiumChart.vue';
import KpiMetricCard from '../components/KpiMetricCard.vue';
import SupervisionPeriodFilters from '../components/SupervisionPeriodFilters.vue';
import {
  useSupervisionDashboardQuery,
  useSupervisionSellersQuery,
} from '../composables/useSupervision';
import { useSupervisionPeriod } from '../composables/useSupervisionPeriod';
import { baseAxis, chartPalette } from '../utils/chart-theme';
import {
  formatCompliance,
  formatPercent,
  KPI_HELP,
  SUPERVISION_ALERT_THRESHOLDS,
} from '../utils/supervision-labels';

const router = useRouter();
const theme = useTheme();
const { year, month, teamId, periodQuery } = useSupervisionPeriod();

const dashboardQuery = useSupervisionDashboardQuery(periodQuery);
const sellersQuery = useSupervisionSellersQuery(
  computed(() => ({ ...periodQuery.value, page: 1, pageSize: 100 })),
);

const loading = computed(() => dashboardQuery.isLoading.value && !dashboardQuery.data.value);

const presentedOption = computed<EChartsCoreOption>(() => {
  const palette = chartPalette(theme.global.current.value.dark);
  const series = dashboardQuery.data.value?.seriesPresented ?? [];
  const target = dashboardQuery.data.value?.compliance.targetValue;
  const days = series.map((s) => s.date.slice(8));
  const option: EChartsCoreOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Presentadas'], textStyle: { color: palette.textSecondary } },
    grid: { left: 40, right: 16, top: 40, bottom: 32 },
    xAxis: { type: 'category', data: days, name: 'Día', ...baseAxis(palette) },
    yAxis: { type: 'value', name: 'Ventas', minInterval: 1, ...baseAxis(palette) },
    series: [
      {
        name: 'Presentadas',
        type: 'line',
        smooth: true,
        data: series.map((s) => s.count),
        itemStyle: { color: palette.primary },
        areaStyle: { color: palette.primary, opacity: 0.12 },
      },
    ],
  };
  if (target != null && target > 0) {
    (option.series as Array<Record<string, unknown>>)[0]!.markLine = {
      symbol: 'none',
      label: { formatter: `Meta mes: ${target}`, color: palette.warning },
      lineStyle: { color: palette.warning, type: 'dashed' },
      data: [{ yAxis: target }],
    };
  }
  return option;
});

const complianceBySellerOption = computed<EChartsCoreOption>(() => {
  const palette = chartPalette(theme.global.current.value.dark);
  const items = (sellersQuery.data.value?.items ?? [])
    .filter((s) => s.compliance.hasGoal && !s.compliance.targetIsZero)
    .slice(0, 12);
  return {
    tooltip: {
      trigger: 'axis',
      valueFormatter: (v: unknown) => `${Number(v).toFixed(0)}%`,
    },
    grid: { left: 100, right: 24, top: 24, bottom: 32 },
    xAxis: { type: 'value', name: '%', ...baseAxis(palette) },
    yAxis: {
      type: 'category',
      data: items.map((s) => `${s.lastName}`),
      ...baseAxis(palette),
    },
    series: [
      {
        type: 'bar',
        data: items.map((s) => Math.round(s.compliance.compliancePercent ?? 0)),
        itemStyle: {
          color: (params: { data: number }) =>
            params.data >= 100
              ? palette.success
              : params.data >= 70
                ? palette.warning
                : palette.error,
        },
      },
    ],
  };
});

const statusDistributionOption = computed<EChartsCoreOption>(() => {
  const palette = chartPalette(theme.global.current.value.dark);
  const data = dashboardQuery.data.value;
  const slices = [
    { name: 'Presentadas', value: data?.pendingReview ?? 0, color: palette.info },
    { name: 'En revisión', value: data?.inReview ?? 0, color: palette.primary },
    { name: 'Devueltas', value: data?.returnedStock ?? 0, color: palette.warning },
  ].filter((s) => s.value > 0);
  return {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: { color: palette.textSecondary } },
    series: [
      {
        type: 'pie',
        radius: ['42%', '68%'],
        data: slices.map((s) => ({ name: s.name, value: s.value, itemStyle: { color: s.color } })),
        label: { color: palette.text },
      },
    ],
  };
});

const behindSellers = computed(() =>
  (sellersQuery.data.value?.items ?? []).filter(
    (s) =>
      s.compliance.hasGoal &&
      !s.compliance.targetIsZero &&
      (s.compliance.compliancePercent ?? 0) < 70,
  ),
);

function goSellers(extra?: Record<string, string>): void {
  void router.push({
    name: 'supervision-sellers',
    query: {
      year: String(year.value),
      month: String(month.value),
      ...(teamId.value ? { teamId: teamId.value } : {}),
      ...extra,
    },
  });
}

function goSeller(id: string): void {
  void router.push({
    name: 'supervision-seller-detail',
    params: { id },
    query: {
      year: String(year.value),
      month: String(month.value),
      ...(teamId.value ? { teamId: teamId.value } : {}),
    },
  });
}

function goAdministratives(): void {
  void router.push({
    name: 'supervision-administratives',
    query: {
      year: String(year.value),
      month: String(month.value),
      ...(teamId.value ? { teamId: teamId.value } : {}),
    },
  });
}
</script>

<template>
  <div data-testid="supervision-dashboard">
    <PageHeader
      title="Supervisión"
      subtitle="Rendimiento de equipos, vendedores y administrativos del período."
    />

    <SupervisionPeriodFilters v-model:year="year" v-model:month="month" v-model:team-id="teamId" />

    <ErrorState
      v-if="dashboardQuery.error.value"
      :message="apiErrorMessage(dashboardQuery.error.value)"
      :request-id="
        isApiError(dashboardQuery.error.value) ? dashboardQuery.error.value.requestId : null
      "
      :loading="dashboardQuery.isFetching.value"
      @retry="dashboardQuery.refetch()"
    />

    <template v-else>
      <v-row dense class="mb-4">
        <v-col cols="12" sm="6" lg="4" xl>
          <KpiMetricCard
            title="Ventas presentadas"
            :value="loading ? '…' : (dashboardQuery.data.value?.salesPresented ?? 0)"
            hint="Primeras presentaciones del mes"
            icon="mdi-file-send-outline"
            :help="KPI_HELP.salesPresented"
            clickable
            @click="goSellers()"
          />
        </v-col>
        <v-col cols="12" sm="6" lg="4" xl>
          <KpiMetricCard
            title="Cumplimiento"
            :value="loading ? '…' : formatCompliance(dashboardQuery.data.value?.compliance)"
            hint="Presentadas ÷ objetivo del alcance"
            icon="mdi-target"
            :help="KPI_HELP.compliance"
            clickable
            @click="goSellers()"
          />
        </v-col>
        <v-col cols="12" sm="6" lg="4" xl>
          <KpiMetricCard
            title="Devueltas (stock)"
            :value="loading ? '…' : (dashboardQuery.data.value?.returnedStock ?? 0)"
            hint="Estado actual RETURNED"
            icon="mdi-backup-restore"
            :help="KPI_HELP.returnedStock"
            clickable
            @click="goSellers()"
          />
        </v-col>
        <v-col cols="12" sm="6" lg="4" xl>
          <KpiMetricCard
            title="En revisión"
            :value="loading ? '…' : (dashboardQuery.data.value?.inReview ?? 0)"
            hint="Stock IN_REVIEW"
            icon="mdi-clipboard-search-outline"
            :help="KPI_HELP.inReview"
          />
        </v-col>
        <v-col cols="12" sm="6" lg="4" xl>
          <KpiMetricCard
            title="Seguimientos pendientes"
            :value="loading ? '…' : (dashboardQuery.data.value?.followUpsPending ?? 0)"
            :hint="`Vencidos: ${dashboardQuery.data.value?.followUpsOverdue ?? 0}`"
            icon="mdi-calendar-clock"
            :help="KPI_HELP.followUpsPending"
            clickable
            @click="goAdministratives()"
          />
        </v-col>
      </v-row>

      <v-row dense class="mb-4">
        <v-col cols="12" lg="7">
          <v-card class="h-100">
            <v-card-item
              title="Evolución del mes"
              subtitle="Presentaciones diarias vs meta mensual (línea de referencia)"
            />
            <v-card-text>
              <AltiumChart :option="presentedOption" height="300px" />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="6" lg="5">
          <v-card class="h-100">
            <v-card-item title="Estados actuales" subtitle="Stock operativo (no eventos del mes)" />
            <v-card-text>
              <AltiumChart :option="statusDistributionOption" height="300px" />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12">
          <v-card>
            <v-card-item
              title="Cumplimiento por vendedor"
              subtitle="Solo vendedores con objetivo; el ícono del chip refuerza el color"
            />
            <v-card-text>
              <AltiumChart
                v-if="(sellersQuery.data.value?.items ?? []).some((s) => s.compliance.hasGoal)"
                :option="complianceBySellerOption"
                height="320px"
              />
              <p v-else class="text-body-2 text-medium-emphasis mb-0">
                No hay objetivos individuales en este período para graficar.
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card class="mb-4">
        <v-card-item title="Requieren atención" prepend-icon="mdi-alert-circle-outline" />
        <v-card-text>
          <v-list lines="two" class="bg-transparent py-0">
            <v-list-item
              v-for="alert in dashboardQuery.data.value?.alerts ?? []"
              :key="alert.code + alert.message"
              :title="alert.message"
              :subtitle="`Umbral documentado · ${alert.code}`"
              :prepend-icon="
                alert.severity === 'critical'
                  ? 'mdi-alert'
                  : alert.severity === 'warning'
                    ? 'mdi-alert-outline'
                    : 'mdi-information-outline'
              "
            >
              <template #append>
                <v-chip
                  size="small"
                  label
                  :color="alert.severity === 'info' ? undefined : 'warning'"
                >
                  {{ alert.severity }}
                </v-chip>
              </template>
            </v-list-item>
            <v-list-item
              title="Presentadas pendientes de revisión"
              :subtitle="`${dashboardQuery.data.value?.pendingReview ?? 0} ventas SUBMITTED`"
              prepend-icon="mdi-inbox-arrow-down"
            />
            <v-list-item
              title="Devoluciones del período"
              :subtitle="`${dashboardQuery.data.value?.returnsInPeriod ?? 0} eventos · tasa ${formatPercent(dashboardQuery.data.value?.returnRate.ratePercent)}`"
              prepend-icon="mdi-backup-restore"
            />
            <v-list-item
              title="Seguimientos vencidos"
              :subtitle="`Alerta desde ${SUPERVISION_ALERT_THRESHOLDS.overdueFollowUpsWarn} · crítico ${SUPERVISION_ALERT_THRESHOLDS.overdueFollowUpsCritical}`"
              prepend-icon="mdi-calendar-alert"
              @click="goAdministratives()"
            >
              <template #append>
                <span class="text-h6 font-weight-bold">
                  {{ dashboardQuery.data.value?.followUpsOverdue ?? 0 }}
                </span>
              </template>
            </v-list-item>
          </v-list>

          <div v-if="behindSellers.length" class="mt-4">
            <p class="text-subtitle-2 font-weight-bold mb-2">Vendedores bajo 70% de cumplimiento</p>
            <div class="d-flex flex-wrap ga-2">
              <v-chip
                v-for="seller in behindSellers"
                :key="seller.sellerId"
                label
                variant="tonal"
                color="warning"
                @click="goSeller(seller.sellerId)"
              >
                {{ seller.lastName }}, {{ seller.firstName }} ·
                {{ formatCompliance(seller.compliance) }}
              </v-chip>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>
