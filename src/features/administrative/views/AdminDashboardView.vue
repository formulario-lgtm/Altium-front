<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { apiErrorMessage, isApiError, type SaleStatus } from '@/services/http';
import { useAdministrativeDashboardQuery } from '../composables/useAdministrative';

const router = useRouter();
const dashboardQuery = useAdministrativeDashboardQuery();

type MetricCard = {
  key: string;
  title: string;
  value: number;
  icon: string;
  hint: string;
  status?: SaleStatus;
  routeName: 'admin-sales' | 'admin-follow-ups';
};

const cards = computed<MetricCard[]>(() => {
  const data = dashboardQuery.data.value;
  return [
    {
      key: 'pendingReview',
      title: 'Presentadas',
      value: data?.pendingReview ?? 0,
      icon: 'mdi-inbox-arrow-down',
      hint: 'Pendientes de revisión',
      status: 'SUBMITTED',
      routeName: 'admin-sales',
    },
    {
      key: 'inReview',
      title: 'En revisión',
      value: data?.inReview ?? 0,
      icon: 'mdi-clipboard-search-outline',
      hint: 'Tomadas por administrativos',
      status: 'IN_REVIEW',
      routeName: 'admin-sales',
    },
    {
      key: 'returned',
      title: 'Devueltas',
      value: data?.returned ?? 0,
      icon: 'mdi-backup-restore',
      hint: 'Esperando corrección del vendedor',
      status: 'RETURNED',
      routeName: 'admin-sales',
    },
    {
      key: 'pendingFollowUps',
      title: 'Seguimientos',
      value: data?.pendingFollowUps ?? 0,
      icon: 'mdi-calendar-clock',
      hint: 'Próximas gestiones vencidas o pendientes',
      routeName: 'admin-follow-ups',
    },
  ];
});

const attentionCount = computed(() => dashboardQuery.data.value?.recentAttention ?? 0);

function openCard(card: MetricCard): void {
  if (card.routeName === 'admin-follow-ups') {
    void router.push({ name: 'admin-follow-ups' });
    return;
  }
  void router.push({
    name: 'admin-sales',
    query: card.status ? { status: card.status } : undefined,
  });
}

function openAttention(): void {
  void router.push({ name: 'admin-sales', query: { status: 'SUBMITTED' } });
}
</script>

<template>
  <div data-testid="admin-dashboard">
    <PageHeader
      title="Inicio operativo"
      subtitle="Indicadores según tu alcance de vendedores asignados."
    />

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
        <v-col v-for="card in cards" :key="card.key" cols="12" sm="6" lg="3">
          <v-card
            class="h-100 admin-metric-card"
            role="button"
            tabindex="0"
            :aria-label="`${card.title}: ${card.value}`"
            @click="openCard(card)"
            @keydown.enter="openCard(card)"
          >
            <v-card-text class="d-flex align-start ga-3">
              <v-avatar color="primary" variant="tonal" size="40" rounded="lg">
                <v-icon :icon="card.icon" />
              </v-avatar>
              <div class="min-w-0">
                <p class="text-caption text-medium-emphasis mb-1">{{ card.title }}</p>
                <p class="text-h5 font-weight-bold mb-1" data-testid="admin-metric-value">
                  {{ dashboardQuery.isLoading.value ? '…' : card.value }}
                </p>
                <p class="text-caption text-medium-emphasis mb-0">{{ card.hint }}</p>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <v-card>
        <v-card-item
          title="Requieren atención"
          subtitle="Ventas presentadas o en revisión con actividad reciente."
          prepend-icon="mdi-alert-circle-outline"
        />
        <v-card-text class="d-flex flex-wrap align-center justify-space-between ga-3">
          <p class="text-body-2 mb-0">
            <span class="text-h6 font-weight-bold me-2">{{ attentionCount }}</span>
            operaciones en los últimos 7 días dentro de tu alcance.
          </p>
          <v-btn color="primary" variant="tonal" @click="openAttention">Ver presentadas</v-btn>
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>

<style scoped lang="scss">
.admin-metric-card {
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;
}

.admin-metric-card:hover,
.admin-metric-card:focus-visible {
  border-color: rgba(var(--v-theme-primary), 0.45) !important;
  outline: none;
}
</style>
