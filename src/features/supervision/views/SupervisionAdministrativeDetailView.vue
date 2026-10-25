<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useTheme } from 'vuetify';
import type { EChartsCoreOption } from 'echarts/core';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { apiErrorMessage, isApiError } from '@/services/http';
import AltiumChart from '../components/AltiumChart.vue';
import SupervisionPeriodFilters from '../components/SupervisionPeriodFilters.vue';
import { useSupervisionAdministrativeQuery } from '../composables/useSupervision';
import { useSupervisionPeriod } from '../composables/useSupervisionPeriod';
import { baseAxis, chartPalette } from '../utils/chart-theme';
import { formatHours, personName } from '../utils/supervision-labels';

const route = useRoute();
const theme = useTheme();
const { year, month, teamId, periodQuery } = useSupervisionPeriod();
const adminId = computed(() => String(route.params.id));
const detailQuery = useSupervisionAdministrativeQuery(adminId, periodQuery);

const activityOption = computed<EChartsCoreOption>(() => {
  const palette = chartPalette(theme.global.current.value.dark);
  const series = detailQuery.data.value?.activitySeries ?? [];
  return {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['Revisiones', 'Devoluciones'],
      textStyle: { color: palette.textSecondary },
    },
    grid: { left: 40, right: 16, top: 40, bottom: 32 },
    xAxis: {
      type: 'category',
      data: series.map((s) => (s.date ?? '').slice(8)),
      ...baseAxis(palette),
    },
    yAxis: { type: 'value', minInterval: 1, ...baseAxis(palette) },
    series: [
      {
        name: 'Revisiones',
        type: 'bar',
        data: series.map((s) => s.reviewsStarted),
        itemStyle: { color: palette.primary },
      },
      {
        name: 'Devoluciones',
        type: 'bar',
        data: series.map((s) => s.returns),
        itemStyle: { color: palette.warning },
      },
    ],
  };
});
</script>

<template>
  <div data-testid="supervision-administrative-detail">
    <PageHeader
      :title="
        detailQuery.data.value
          ? personName(detailQuery.data.value.firstName, detailQuery.data.value.lastName)
          : 'Administrativo'
      "
      subtitle="Volumen de gestiones y tiempos — no implica ranking de calidad."
    >
      <template #actions>
        <v-btn variant="text" :to="{ name: 'supervision-administratives', query: $route.query }">
          Volver
        </v-btn>
      </template>
    </PageHeader>

    <SupervisionPeriodFilters v-model:year="year" v-model:month="month" v-model:team-id="teamId" />

    <ErrorState
      v-if="detailQuery.error.value"
      :message="apiErrorMessage(detailQuery.error.value)"
      :request-id="isApiError(detailQuery.error.value) ? detailQuery.error.value.requestId : null"
      :loading="detailQuery.isFetching.value"
      @retry="detailQuery.refetch()"
    />

    <template v-else-if="detailQuery.data.value">
      <v-row dense class="mb-4">
        <v-col cols="6" md="3">
          <v-card class="pa-4 h-100">
            <p class="text-caption text-medium-emphasis mb-1">Revisiones iniciadas</p>
            <p class="text-h5 font-weight-bold mb-0">{{ detailQuery.data.value.reviewsStarted }}</p>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card class="pa-4 h-100">
            <p class="text-caption text-medium-emphasis mb-1">Tiempo 1ª revisión</p>
            <p class="text-h5 font-weight-bold mb-0">
              {{ formatHours(detailQuery.data.value.avgFirstReviewHours) }}
            </p>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card class="pa-4 h-100">
            <p class="text-caption text-medium-emphasis mb-1">Devoluciones</p>
            <p class="text-h5 font-weight-bold mb-0">
              {{ detailQuery.data.value.returnsPerformed }}
            </p>
          </v-card>
        </v-col>
        <v-col cols="6" md="3">
          <v-card class="pa-4 h-100">
            <p class="text-caption text-medium-emphasis mb-1">Carga actual</p>
            <p class="text-h5 font-weight-bold mb-0">
              {{ detailQuery.data.value.currentWorkload }}
            </p>
          </v-card>
        </v-col>
      </v-row>

      <v-row dense class="mb-4">
        <v-col cols="12" md="4">
          <v-card class="pa-4 h-100">
            <p class="text-subtitle-2 font-weight-bold mb-2">Volumen del período</p>
            <p class="text-body-2 mb-1">
              Observaciones: {{ detailQuery.data.value.observationsCreated }}
            </p>
            <p class="text-body-2 mb-1">
              Seguimientos registrados: {{ detailQuery.data.value.followUpsCreated }}
            </p>
            <p class="text-caption text-medium-emphasis mb-0">
              Cuenta acciones reales, no lecturas de pantallas.
            </p>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="pa-4 h-100">
            <p class="text-subtitle-2 font-weight-bold mb-2">Seguimientos</p>
            <p class="text-body-2 mb-1">
              Pendientes: {{ detailQuery.data.value.followUpsPending }}
            </p>
            <p class="text-body-2 mb-0">Vencidos: {{ detailQuery.data.value.followUpsOverdue }}</p>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card class="pa-4 h-100">
            <p class="text-subtitle-2 font-weight-bold mb-2">Tiempos</p>
            <p class="text-body-2 mb-0">
              Promedio hasta la primera revisión administrativa:
              {{ formatHours(detailQuery.data.value.avgFirstReviewHours) }}. Diferente del volumen
              de gestiones.
            </p>
          </v-card>
        </v-col>
      </v-row>

      <v-card>
        <v-card-item title="Evolución diaria de actividad" />
        <v-card-text>
          <AltiumChart
            v-if="detailQuery.data.value.activitySeries.length"
            :option="activityOption"
            height="300px"
          />
          <p v-else class="text-medium-emphasis mb-0">Sin actividad registrada en el período.</p>
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>
