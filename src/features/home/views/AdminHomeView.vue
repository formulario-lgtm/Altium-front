<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { apiErrorMessage, isApiError } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import { formatDateTime } from '@/utils/format';
import HomeAlertList from '../components/HomeAlertList.vue';
import HomeChartCard from '../components/HomeChartCard.vue';
import HomeKpiGrid from '../components/HomeKpiGrid.vue';
import HomePeriodFilters from '../components/HomePeriodFilters.vue';
import HomeQuickActions from '../components/HomeQuickActions.vue';
import HomeSection from '../components/HomeSection.vue';
import { useAdminHomeQuery } from '../composables/useHome';
import { useHomePeriod } from '../composables/useHomePeriod';
import {
  buildPresentedLineOption,
  buildTeamPerformanceOption,
  paletteFromTheme,
  seriesHasData,
} from '../utils/home-charts';
import { formatHomeCompliance, periodLabel } from '../utils/home-labels';
import { ADMIN_QUICK_ACTIONS, adminKpiRoute, alertRoute } from '../utils/home-navigation';

const auth = useAuthStore();
const theme = useTheme();
const router = useRouter();
const { year, month, teamId, periodQuery } = useHomePeriod({
  allowPastMonths: true,
  syncRoute: true,
  enableTeam: true,
});
const homeQuery = useAdminHomeQuery(periodQuery);

const greeting = computed(() => `Hola, ${auth.user?.firstName ?? ''}`.trim());
const periodText = computed(() => periodLabel(year.value, month.value));
const palette = computed(() => paletteFromTheme(theme.global.current.value.dark));

const monthlyOption = computed(() => {
  const series = homeQuery.data.value?.monthlyPresented ?? [];
  if (!seriesHasData(series)) return null;
  return buildPresentedLineOption(series, palette.value, {
    seriesName: 'Presentadas',
    periodLabel: periodText.value,
  });
});

const teamOption = computed(() => {
  const teams = homeQuery.data.value?.teamPerformance ?? [];
  if (teams.length === 0) return null;
  return buildTeamPerformanceOption(
    teams.map((t) => ({
      teamName: t.teamName,
      salesPresented: t.salesPresented,
      compliancePercent: t.compliance.compliancePercent,
      hasGoal: t.compliance.hasGoal,
    })),
    palette.value,
  );
});

const hasMonthlyData = computed(() => seriesHasData(homeQuery.data.value?.monthlyPresented));
const hasTeamData = computed(() => (homeQuery.data.value?.teamPerformance.length ?? 0) > 0);

function openAudit(): void {
  void router.push({ name: 'audit' });
}
</script>

<template>
  <div data-testid="admin-home">
    <PageHeader :title="greeting" :subtitle="`Resumen ejecutivo · ${periodText}`">
      <template #actions>
        <HomeQuickActions inline :actions="ADMIN_QUICK_ACTIONS" />
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
      <HomeKpiGrid :kpis="homeQuery.data.value.kpis" :resolve-route="adminKpiRoute" />

      <v-row dense class="home-panels">
        <v-col cols="12" md="5" class="d-flex">
          <HomeSection title="Pendientes y riesgos" subtitle="Alertas globales del sistema.">
            <v-card class="home-panel-card">
              <v-card-text>
                <HomeAlertList
                  :alerts="homeQuery.data.value.alerts"
                  :resolve-route="(a) => alertRoute(a, 'admin')"
                />
              </v-card-text>
            </v-card>
          </HomeSection>
        </v-col>
        <v-col cols="12" md="7" class="d-flex">
          <HomeSection
            title="Indicadores complementarios"
            subtitle="Conteos de seguimiento, usuarios y objetivos."
          >
            <v-row dense>
              <v-col cols="6" sm="4">
                <v-card variant="tonal" class="h-100">
                  <v-card-text>
                    <p class="text-caption text-medium-emphasis mb-1">Seguimientos vencidos</p>
                    <p class="text-h6 mb-0">{{ homeQuery.data.value.followUpsOverdue }}</p>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" sm="4">
                <v-card variant="tonal" class="h-100">
                  <v-card-text>
                    <p class="text-caption text-medium-emphasis mb-1">Presentadas demoradas</p>
                    <p class="text-h6 mb-0">{{ homeQuery.data.value.staleSubmitted }}</p>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" sm="4">
                <v-card variant="tonal" class="h-100">
                  <v-card-text>
                    <p class="text-caption text-medium-emphasis mb-1">Equipos sin objetivo</p>
                    <p class="text-h6 mb-0">{{ homeQuery.data.value.teamsWithoutGoal }}</p>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" sm="4">
                <v-card variant="tonal" class="h-100">
                  <v-card-text>
                    <p class="text-caption text-medium-emphasis mb-1">Pendientes de activación</p>
                    <p class="text-h6 mb-0">{{ homeQuery.data.value.usersPendingActivation }}</p>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" sm="4">
                <v-card variant="tonal" class="h-100">
                  <v-card-text>
                    <p class="text-caption text-medium-emphasis mb-1">Cuentas suspendidas</p>
                    <p class="text-h6 mb-0">{{ homeQuery.data.value.usersSuspended }}</p>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="6" sm="4">
                <v-card variant="tonal" class="h-100">
                  <v-card-text>
                    <p class="text-caption text-medium-emphasis mb-1">Cumplimiento global</p>
                    <p class="text-h6 mb-0">
                      {{ formatHomeCompliance(homeQuery.data.value.comparableCompliance) }}
                    </p>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </HomeSection>
        </v-col>
      </v-row>

      <v-row dense class="mb-6 home-panels">
        <v-col cols="12" md="6" class="d-flex">
          <HomeChartCard
            :title="`Evolución · ${periodText}`"
            subtitle="Presentaciones en el período"
            :option="monthlyOption"
            :has-data="hasMonthlyData"
          />
        </v-col>
        <v-col cols="12" md="6" class="d-flex">
          <HomeChartCard
            title="Rendimiento por equipos"
            subtitle="Presentadas y cumplimiento comparable"
            :option="teamOption"
            :has-data="hasTeamData"
            empty-text="No hay equipos con datos en el período."
          />
        </v-col>
      </v-row>

      <HomeSection title="Eventos de seguridad y administración">
        <v-card>
          <v-card-text>
            <v-list
              v-if="homeQuery.data.value.recentSecurityEvents.length > 0"
              lines="two"
              class="bg-transparent pa-0"
              data-testid="home-security-events"
            >
              <v-list-item
                v-for="event in homeQuery.data.value.recentSecurityEvents"
                :key="event.id"
                role="link"
                tabindex="0"
                @click="openAudit()"
                @keydown.enter="openAudit()"
              >
                <v-list-item-title>{{ event.action }}</v-list-item-title>
                <v-list-item-subtitle>
                  {{ event.entityType }} · {{ formatDateTime(event.occurredAt) }} ·
                  {{ event.outcome }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <p v-else class="text-body-2 text-medium-emphasis mb-0">
              Sin eventos recientes de seguridad o administración.
            </p>
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
