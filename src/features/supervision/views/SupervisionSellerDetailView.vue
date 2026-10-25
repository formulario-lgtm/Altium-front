<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import type { EChartsCoreOption } from 'echarts/core';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { apiErrorMessage, isApiError, type SaleStatus } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import AltiumChart from '../components/AltiumChart.vue';
import ComplianceChip from '../components/ComplianceChip.vue';
import SupervisionPeriodFilters from '../components/SupervisionPeriodFilters.vue';
import { useSupervisionSellerQuery } from '../composables/useSupervision';
import { useSupervisionPeriod } from '../composables/useSupervisionPeriod';
import { baseAxis, chartPalette } from '../utils/chart-theme';
import { formatDateTime, formatSaleNumber } from '@/utils/format';
import { formatPercent, KPI_HELP, personName, saleStatusLabel } from '../utils/supervision-labels';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const theme = useTheme();
const { year, month, teamId, periodQuery } = useSupervisionPeriod();
const sellerId = computed(() => String(route.params.id));

const sellerQuery = useSupervisionSellerQuery(sellerId, periodQuery);
const canOpenSale = computed(() => auth.hasPermission('sales.read'));

const seriesOption = computed<EChartsCoreOption>(() => {
  const palette = chartPalette(theme.global.current.value.dark);
  const series = sellerQuery.data.value?.seriesPresented ?? [];
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 16, top: 24, bottom: 32 },
    xAxis: {
      type: 'category',
      data: series.map((s) => s.date.slice(8)),
      ...baseAxis(palette),
    },
    yAxis: { type: 'value', minInterval: 1, ...baseAxis(palette) },
    series: [
      {
        type: 'line',
        smooth: true,
        data: series.map((s) => s.count),
        itemStyle: { color: palette.primary },
      },
    ],
  };
});

const statusOption = computed<EChartsCoreOption>(() => {
  const palette = chartPalette(theme.global.current.value.dark);
  const dist = sellerQuery.data.value?.statusDistribution ?? [];
  return {
    tooltip: { trigger: 'item' },
    series: [
      {
        type: 'pie',
        radius: ['40%', '65%'],
        data: dist.map((row, i) => ({
          name: saleStatusLabel(row.status ?? ''),
          value: row.count ?? 0,
          itemStyle: { color: palette.series[i % palette.series.length] },
        })),
        label: { color: palette.text },
      },
    ],
  };
});

function openSale(id: string): void {
  if (!canOpenSale.value) return;
  void router.push({ name: 'sale-detail', params: { id } });
}
</script>

<template>
  <div data-testid="supervision-seller-detail">
    <PageHeader
      :title="
        sellerQuery.data.value
          ? personName(sellerQuery.data.value.firstName, sellerQuery.data.value.lastName)
          : 'Vendedor'
      "
      subtitle="Detalle de rendimiento del período seleccionado."
    >
      <template #actions>
        <v-btn variant="text" :to="{ name: 'supervision-sellers', query: $route.query }">
          Volver
        </v-btn>
      </template>
    </PageHeader>

    <SupervisionPeriodFilters v-model:year="year" v-model:month="month" v-model:team-id="teamId" />

    <ErrorState
      v-if="sellerQuery.error.value"
      :message="apiErrorMessage(sellerQuery.error.value)"
      :request-id="isApiError(sellerQuery.error.value) ? sellerQuery.error.value.requestId : null"
      :loading="sellerQuery.isFetching.value"
      @retry="sellerQuery.refetch()"
    />

    <template v-else-if="sellerQuery.data.value">
      <v-row dense class="mb-4">
        <v-col cols="12" md="3">
          <v-card class="pa-4 h-100">
            <p class="text-caption text-medium-emphasis mb-1">Presentadas</p>
            <p class="text-h5 font-weight-bold mb-1">{{ sellerQuery.data.value.salesPresented }}</p>
            <p class="text-caption text-medium-emphasis mb-0">{{ KPI_HELP.salesPresented }}</p>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card class="pa-4 h-100">
            <p class="text-caption text-medium-emphasis mb-2">Cumplimiento</p>
            <ComplianceChip :compliance="sellerQuery.data.value.compliance" />
            <p class="text-caption text-medium-emphasis mt-2 mb-0">{{ KPI_HELP.compliance }}</p>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card class="pa-4 h-100">
            <p class="text-caption text-medium-emphasis mb-1">Devueltas (stock)</p>
            <p class="text-h5 font-weight-bold mb-1">{{ sellerQuery.data.value.returnedStock }}</p>
            <p class="text-caption text-medium-emphasis mb-0">
              Tasa del mes: {{ formatPercent(sellerQuery.data.value.returnRate.ratePercent) }}
            </p>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card class="pa-4 h-100">
            <p class="text-caption text-medium-emphasis mb-1">Cola operativa</p>
            <p class="text-body-2 mb-0">
              Presentadas: {{ sellerQuery.data.value.pendingReview }} · En revisión:
              {{ sellerQuery.data.value.inReview }}
            </p>
          </v-card>
        </v-col>
      </v-row>

      <v-row dense class="mb-4">
        <v-col cols="12" md="7">
          <v-card>
            <v-card-item title="Evolución diaria del mes" />
            <v-card-text><AltiumChart :option="seriesOption" /></v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" md="5">
          <v-card>
            <v-card-item title="Distribución por estado" />
            <v-card-text><AltiumChart :option="statusOption" /></v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card class="mb-4">
        <v-card-item title="Planes / prepagas (presentaciones del mes)" />
        <v-card-text>
          <v-table v-if="sellerQuery.data.value.planDistribution.length" density="comfortable">
            <thead>
              <tr>
                <th>Prepaga</th>
                <th>Plan</th>
                <th class="text-end">Cantidad</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in sellerQuery.data.value.planDistribution" :key="i">
                <td>{{ row.healthInsurerName }}</td>
                <td>{{ row.healthPlanName ?? '—' }}</td>
                <td class="text-end">{{ row.count }}</td>
              </tr>
            </tbody>
          </v-table>
          <p v-else class="text-medium-emphasis mb-0">Sin presentaciones en el período.</p>
        </v-card-text>
      </v-card>

      <v-card>
        <v-card-item
          title="Operaciones recientes del período"
          :subtitle="
            canOpenSale
              ? 'Podés abrir el detalle de venta (solo lectura según permisos).'
              : 'Sin permiso sales.read: solo se listan los números.'
          "
        />
        <v-card-text>
          <v-list
            v-if="sellerQuery.data.value.recentSales.length"
            lines="two"
            class="bg-transparent"
          >
            <v-list-item
              v-for="sale in sellerQuery.data.value.recentSales"
              :key="sale.id"
              :title="formatSaleNumber(sale.saleNumber)"
              :subtitle="
                sale.firstSubmittedAt ? formatDateTime(sale.firstSubmittedAt) : ''
              "
              :disabled="!canOpenSale || !sale.id"
              @click="sale.id && openSale(sale.id)"
            >
              <template #append>
                <StatusBadge :status="sale.status as SaleStatus" />
              </template>
            </v-list-item>
          </v-list>
          <p v-else class="text-medium-emphasis mb-0">Sin operaciones en el período.</p>
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>
