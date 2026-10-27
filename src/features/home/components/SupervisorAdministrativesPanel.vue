<script setup lang="ts">
import { computed } from 'vue';
import type { SupervisorHome, HomePeriodTeamQuery } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import { roleLabel } from '@/utils/role-labels';
import HomePanel from './HomePanel.vue';
import SupervisorMobileMetrics from './SupervisorMobileMetrics.vue';
import SupervisorShareChart from './SupervisorShareChart.vue';
import { withHomePeriod } from '../utils/home-navigation';
const props = defineProps<{ home: SupervisorHome; period: HomePeriodTeamQuery }>();
const auth = useAuthStore();
const shares = computed(() =>
  props.home.administratives.map((row) => ({
    id: row.administrativeUserId,
    name: `${row.firstName} ${row.lastName}`,
    value: row.reviewsStarted,
  })),
);
const mobileItems = computed(() => [
  ...props.home.administratives.map((row) => ({
    id: row.administrativeUserId,
    name: `${row.firstName} ${row.lastName}`,
    to:
      auth.hasPermission('supervision.analytics.read') && row.roleCode === 'ADMINISTRATIVE'
        ? (withHomePeriod(
            { name: 'supervision-administrative-detail', params: { id: row.administrativeUserId } },
            props.period,
          ) ?? undefined)
        : undefined,
    primary: 'revisadas',
    value: row.reviewsStarted,
    metrics: [
      { label: 'aprobadas', value: row.approved },
      { label: 'rechazadas', value: row.rejected },
      { label: 'devoluciones', value: row.returns },
      { label: 'pendientes actuales', value: row.currentWorkload },
    ],
  })),
  {
    id: 'total',
    name: 'Total de gestión',
    primary: 'revisadas',
    value: props.home.administrativeTotals.reviewsStarted,
    metrics: [
      { label: 'aprobadas', value: props.home.administrativeTotals.approved },
      { label: 'rechazadas', value: props.home.administrativeTotals.rejected },
      { label: 'devoluciones', value: props.home.administrativeTotals.returns },
      { label: 'pendientes actuales', value: props.home.administrativeTotals.currentWorkload },
    ],
  },
]);
</script>
<template>
  <HomePanel
    title="Administrativos"
    subtitle="Revisiones y resoluciones realizadas durante el mes."
    data-testid="supervisor-administratives-panel"
  >
    <div class="d-flex align-baseline ga-2 mb-2">
      <strong class="text-h4">{{ home.administrativeTotals.reviewsStarted }}</strong
      ><span class="text-body-2 text-medium-emphasis"
        >ventas revisadas · {{ home.administratives.length }} responsables</span
      >
    </div>
    <h3 class="text-subtitle-2">Revisiones por responsable</h3>
    <SupervisorShareChart
      :items="shares"
      label="Ventas revisadas por responsable"
      empty-text="Todavía no se iniciaron revisiones en el período."
    />
    <v-divider class="my-4" />
    <h3 class="text-subtitle-2 mb-2">Detalle de gestión</h3>
    <v-table
      v-if="home.administratives.length"
      density="compact"
      class="supervisor-month-table d-none d-sm-block"
    >
      <thead class="text-caption">
        <tr>
          <th>Responsable</th>
          <th>Revisadas</th>
          <th>Aprobadas</th>
          <th>Rechazadas</th>
          <th>Devoluciones</th>
          <th>Pendientes actuales</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in home.administratives" :key="row.administrativeUserId">
          <td>
            <router-link
              v-if="
                auth.hasPermission('supervision.analytics.read') &&
                row.roleCode === 'ADMINISTRATIVE'
              "
              :to="
                withHomePeriod(
                  {
                    name: 'supervision-administrative-detail',
                    params: { id: row.administrativeUserId },
                  },
                  period,
                ) ?? {}
              "
              >{{ row.firstName }} {{ row.lastName }}</router-link
            ><span v-else>{{ row.firstName }} {{ row.lastName }}</span
            ><small v-if="row.roleCode !== 'ADMINISTRATIVE'" class="d-block text-medium-emphasis">{{
              roleLabel(row.roleCode)
            }}</small>
          </td>
          <td>{{ row.reviewsStarted }}</td>
          <td>{{ row.approved }}</td>
          <td>{{ row.rejected }}</td>
          <td>{{ row.returns }}</td>
          <td>{{ row.currentWorkload }}</td>
        </tr>
      </tbody>
      <tfoot>
        <tr class="font-weight-bold">
          <td>Total</td>
          <td>{{ home.administrativeTotals.reviewsStarted }}</td>
          <td>{{ home.administrativeTotals.approved }}</td>
          <td>{{ home.administrativeTotals.rejected }}</td>
          <td>{{ home.administrativeTotals.returns }}</td>
          <td>{{ home.administrativeTotals.currentWorkload }}</td>
        </tr>
      </tfoot>
    </v-table>
    <SupervisorMobileMetrics
      v-if="home.administratives.length"
      :items="mobileItems"
      class="d-sm-none"
      data-testid="supervisor-admin-mobile-metrics"
    />
    <p v-else class="text-body-2 text-medium-emphasis">
      No hay administrativos ni gestiones en el alcance seleccionado.
    </p>
    <p class="text-caption text-medium-emphasis mt-3 mb-0">
      Revisadas: una por venta, atribuida a quien inició la primera revisión del mes. Las
      devoluciones cuentan cada movimiento. Las resoluciones pueden corresponder a ventas de meses
      anteriores.
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
  width: 26%;
}
</style>
