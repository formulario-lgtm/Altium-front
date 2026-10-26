<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { apiErrorMessage, isApiError } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import AdminOperationsList from '../components/AdminOperationsList.vue';
import HomeAlertList from '../components/HomeAlertList.vue';
import HomeChartCard from '../components/HomeChartCard.vue';
import HomeGoalProgress from '../components/HomeGoalProgress.vue';
import HomeKpiGrid from '../components/HomeKpiGrid.vue';
import HomePanel from '../components/HomePanel.vue';
import HomePeriodFilters from '../components/HomePeriodFilters.vue';
import HomeQuickActions from '../components/HomeQuickActions.vue';
import HomeSecurityList from '../components/HomeSecurityList.vue';
import { useAdminHomeQuery } from '../composables/useHome';
import { useHomePeriod } from '../composables/useHomePeriod';
import {
  buildMonthlyCountOption,
  buildTeamPerformanceOption,
  paletteFromTheme,
  seriesHasData,
} from '../utils/home-charts';
import { periodLabel } from '../utils/home-labels';
import {
  ADMIN_QUICK_ACTIONS,
  adminKpiRoute,
  alertRoute,
  withHomePeriod,
} from '../utils/home-navigation';

const auth = useAuthStore();
const theme = useTheme();
const { year, month, periodQuery } = useHomePeriod({
  allowPastMonths: true,
  syncRoute: true,
  enableTeam: false,
});
const homeQuery = useAdminHomeQuery(periodQuery);
const greeting = computed(() => `Hola, ${auth.user?.firstName ?? ''}`.trim());
const periodText = computed(() => periodLabel(year.value, month.value));
const palette = computed(() => paletteFromTheme(theme.global.current.value.dark));
const headerActions = ADMIN_QUICK_ACTIONS.filter((action) =>
  ['admin-sales', 'users'].includes(action.key),
);
const secondaryActions = computed(() =>
  ADMIN_QUICK_ACTIONS.filter((action) => !['admin-sales', 'users'].includes(action.key)).map(
    (action) => ({
      ...action,
      to:
        action.key === 'supervision'
          ? (withHomePeriod(action.to, periodQuery.value) ?? action.to)
          : action.to,
    }),
  ),
);
const hasMonthlyData = computed(() => seriesHasData(homeQuery.data.value?.monthlyPresented));
const monthlyOption = computed(() =>
  hasMonthlyData.value
    ? buildMonthlyCountOption(homeQuery.data.value?.monthlyPresented ?? [], palette.value)
    : null,
);
const hasTeamData = computed(() => (homeQuery.data.value?.teamPerformance.length ?? 0) > 0);
const teamOption = computed(() =>
  hasTeamData.value
    ? buildTeamPerformanceOption(
        (homeQuery.data.value?.teamPerformance ?? []).map((team) => ({
          teamName: team.teamName,
          salesPresented: team.salesPresented,
          compliancePercent: team.compliance.compliancePercent,
          hasGoal: team.compliance.hasGoal,
        })),
        palette.value,
      )
    : null,
);
// These categories already have a count and direct destination in the operations list.
const additionalAlerts = computed(() =>
  (homeQuery.data.value?.alerts ?? []).filter(
    (alert) =>
      ![
        'OVERDUE_FOLLOW_UPS',
        'STALE_SUBMITTED',
        'TEAMS_WITHOUT_GOAL',
        'PENDING_ACTIVATION',
        'SUSPENDED_USERS',
        'NO_GOAL',
      ].includes(alert.code),
  ),
);
</script>

<template>
  <div data-testid="admin-home">
    <PageHeader :title="greeting" :subtitle="`Resumen ejecutivo global · ${periodText}`">
      <template #actions
        ><HomeQuickActions inline primary-key="admin-sales" :actions="headerActions"
      /></template>
    </PageHeader>
    <HomePeriodFilters v-model:year="year" v-model:month="month" />
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
        :resolve-route="adminKpiRoute"
        compact-mobile
        class="mb-5"
      />
      <v-row class="mb-3">
        <v-col cols="12" lg="6" class="d-flex">
          <HomePanel
            title="Pendientes y riesgos"
            subtitle="Revisá las gestiones y cuentas que necesitan seguimiento."
            data-testid="admin-priorities"
          >
            <AdminOperationsList :home="homeQuery.data.value" :period="periodQuery" />
            <HomeAlertList
              v-if="additionalAlerts.length"
              :alerts="additionalAlerts"
              :resolve-route="(alert) => alertRoute(alert, 'admin')"
              class="mt-3"
            />
          </HomePanel>
        </v-col>
        <v-col cols="12" lg="6" class="d-flex">
          <HomePanel
            title="Seguridad y administración"
            subtitle="Últimos movimientos registrados en el sistema."
            data-testid="admin-security"
          >
            <template #actions
              ><v-btn
                v-if="auth.hasPermission('audit.read')"
                :to="{ name: 'audit' }"
                variant="text"
                color="primary"
                size="small"
                append-icon="mdi-arrow-right"
                >Ver auditoría</v-btn
              ></template
            >
            <HomeSecurityList :events="homeQuery.data.value.recentSecurityEvents" />
            <div
              v-if="
                secondaryActions.some(
                  (action) => !action.permission || auth.hasPermission(action.permission),
                )
              "
              class="mt-auto pt-4"
            >
              <v-divider class="mb-4" />
              <h3 class="text-subtitle-2 mb-3">Accesos rápidos</h3>
              <HomeQuickActions :actions="secondaryActions" />
            </div>
          </HomePanel>
        </v-col>
      </v-row>
      <v-row class="mb-3">
        <v-col cols="12" lg="6" class="d-flex">
          <HomeChartCard
            title="Avance comercial"
            :subtitle="periodText"
            :option="monthlyOption"
            :has-data="hasMonthlyData"
            height="220px"
            empty-text="No hay ventas presentadas en el período seleccionado."
          >
            <template #summary
              ><HomeGoalProgress
                :compliance="homeQuery.data.value.comparableCompliance"
                label="Objetivo global"
              />
              <h3 class="text-subtitle-2 mb-1">Ventas presentadas · Últimos 6 meses</h3></template
            >
          </HomeChartCard>
        </v-col>
        <v-col cols="12" lg="6" class="d-flex">
          <HomeChartCard
            title="Rendimiento por equipos"
            subtitle="Ventas presentadas y porcentaje de cumplimiento de cada equipo."
            :option="teamOption"
            :has-data="hasTeamData"
            height="220px"
            empty-text="No hay equipos con datos en este período."
          >
            <template #actions
              ><v-btn
                v-if="auth.hasPermission('supervision.analytics.read')"
                :to="withHomePeriod({ name: 'supervision-sellers' }, periodQuery) ?? undefined"
                variant="text"
                color="primary"
                size="small"
                append-icon="mdi-arrow-right"
                >Ver supervisión</v-btn
              ></template
            >
          </HomeChartCard>
        </v-col>
      </v-row>
    </template>
    <v-skeleton-loader v-else-if="homeQuery.isLoading.value" type="article, article" />
  </div>
</template>
