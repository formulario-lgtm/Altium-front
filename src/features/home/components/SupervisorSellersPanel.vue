<script setup lang="ts">
import { computed } from 'vue';
import type { SupervisorHome, HomePeriodTeamQuery } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import HomePanel from './HomePanel.vue';
import SupervisorMobileMetrics from './SupervisorMobileMetrics.vue';
import SupervisorShareChart from './SupervisorShareChart.vue';
import { withHomePeriod } from '../utils/home-navigation';
const props = defineProps<{ home: SupervisorHome; period: HomePeriodTeamQuery }>();
const auth = useAuthStore();
const shares = computed(() =>
  props.home.sellers.map((row) => ({
    id: row.sellerId,
    name: `${row.firstName} ${row.lastName}`,
    value: row.salesPresented,
  })),
);
const mobileItems = computed(() => [
  ...props.home.sellers.map((row) => ({
    id: row.sellerId,
    name: `${row.firstName} ${row.lastName}`,
    to: auth.hasPermission('supervision.analytics.read')
      ? (withHomePeriod(
          { name: 'supervision-seller-detail', params: { id: row.sellerId } },
          props.period,
        ) ?? undefined)
      : undefined,
    primary: 'presentadas',
    value: row.salesPresented,
    metrics: [
      { label: 'por revisar', value: row.submitted },
      { label: 'en revisión', value: row.inReview },
      { label: 'aprobadas', value: row.approved },
      { label: 'rechazadas', value: row.rejected },
      { label: 'devueltas', value: row.returned },
    ],
  })),
  {
    id: 'total',
    name: 'Total del mes',
    primary: 'presentadas',
    value: props.home.sellerTotals.salesPresented,
    metrics: [
      { label: 'por revisar', value: props.home.sellerTotals.submitted },
      { label: 'en revisión', value: props.home.sellerTotals.inReview },
      { label: 'aprobadas', value: props.home.sellerTotals.approved },
      { label: 'rechazadas', value: props.home.sellerTotals.rejected },
      { label: 'devueltas', value: props.home.sellerTotals.returned },
    ],
  },
]);
</script>
<template>
  <HomePanel
    title="Vendedores"
    subtitle="Ventas presentadas en el mes y su estado actual."
    data-testid="supervisor-sellers-panel"
  >
    <div class="d-flex align-baseline ga-2 mb-2">
      <strong class="text-h4">{{ home.sellerTotals.salesPresented }}</strong
      ><span class="text-body-2 text-medium-emphasis"
        >ventas presentadas · {{ home.sellers.length }} vendedores</span
      >
    </div>
    <h3 class="text-subtitle-2">Participación por vendedor</h3>
    <SupervisorShareChart
      :items="shares"
      label="Ventas presentadas por vendedor"
      empty-text="Todavía no hay ventas presentadas en el período."
    />
    <v-divider class="my-4" />
    <h3 class="text-subtitle-2 mb-2">Detalle por vendedor</h3>
    <v-table
      v-if="home.sellers.length"
      density="compact"
      class="supervisor-month-table d-none d-sm-block"
    >
      <thead class="text-caption">
        <tr>
          <th>Vendedor</th>
          <th title="Ventas presentadas en el mes">Ventas</th>
          <th title="Presentadas pendientes de revisión">Por revisar</th>
          <th>En revisión</th>
          <th>Aprobadas</th>
          <th>Rechazadas</th>
          <th>Devueltas</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in home.sellers" :key="row.sellerId">
          <td>
            <router-link
              v-if="auth.hasPermission('supervision.analytics.read')"
              :to="
                withHomePeriod(
                  { name: 'supervision-seller-detail', params: { id: row.sellerId } },
                  period,
                ) ?? {}
              "
              >{{ row.firstName }} {{ row.lastName }}</router-link
            ><span v-else>{{ row.firstName }} {{ row.lastName }}</span>
          </td>
          <td>{{ row.salesPresented }}</td>
          <td>{{ row.submitted }}</td>
          <td>{{ row.inReview }}</td>
          <td>{{ row.approved }}</td>
          <td>{{ row.rejected }}</td>
          <td>{{ row.returned }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="font-weight-bold">
          <td>Total</td>
          <td>{{ home.sellerTotals.salesPresented }}</td>
          <td>{{ home.sellerTotals.submitted }}</td>
          <td>{{ home.sellerTotals.inReview }}</td>
          <td>{{ home.sellerTotals.approved }}</td>
          <td>{{ home.sellerTotals.rejected }}</td>
          <td>{{ home.sellerTotals.returned }}</td>
        </tr>
      </tfoot>
    </v-table>
    <SupervisorMobileMetrics
      v-if="home.sellers.length"
      :items="mobileItems"
      class="d-sm-none"
      data-testid="supervisor-seller-mobile-metrics"
    />
    <p v-else class="text-body-2 text-medium-emphasis">
      No hay vendedores en tus equipos para este período.
    </p>
    <p class="text-caption text-medium-emphasis mt-3 mb-0">
      Cada venta se cuenta una vez, por su primera presentación. Pendientes: presentadas que todavía
      esperan revisión.
    </p>
  </HomePanel>
</template>
<style scoped>
.supervisor-month-table {
  min-width: 0;
}
.supervisor-month-table :deep(table) {
  min-width: 0;
  width: 100%;
  table-layout: fixed;
}
.supervisor-month-table
  :deep(.v-table__wrapper > table > :is(thead, tbody, tfoot) > tr > :is(th, td)) {
  padding-inline: 6px;
  overflow-wrap: normal;
}
.supervisor-month-table :deep(td:first-child) {
  white-space: normal;
  overflow-wrap: anywhere;
}
.supervisor-month-table :deep(th:first-child) {
  width: 22%;
}
</style>
