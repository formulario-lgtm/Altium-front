<script setup lang="ts">
import { computed, ref } from 'vue';
import EmptyState from '@/components/common/EmptyState.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { apiErrorMessage, isApiError, type MonthlyGoal } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import GoalFormDialog from '../components/GoalFormDialog.vue';
import SupervisionPeriodFilters from '../components/SupervisionPeriodFilters.vue';
import {
  useSupervisionGoalHistoryQuery,
  useSupervisionGoalsQuery,
  useSupervisionSellersQuery,
  useSupervisionTeamsQuery,
} from '../composables/useSupervision';
import { useSupervisionPeriod } from '../composables/useSupervisionPeriod';
import { formatDateTime } from '@/utils/format';
import { GOAL_TYPE_OPTIONS, MONTH_OPTIONS } from '../utils/supervision-labels';

const auth = useAuthStore();
const { year, month, teamId, periodQuery } = useSupervisionPeriod();
const canManage = computed(() => auth.hasPermission('supervision.goals.manage'));

const goalsQuery = useSupervisionGoalsQuery(
  computed(() => ({
    year: periodQuery.value.year,
    month: periodQuery.value.month,
    ...(periodQuery.value.teamId ? { teamId: periodQuery.value.teamId } : {}),
  })),
);
const sellersQuery = useSupervisionSellersQuery(
  computed(() => ({ ...periodQuery.value, page: 1, pageSize: 100 })),
);
const teamsQuery = useSupervisionTeamsQuery();

const dialogOpen = ref(false);
const editing = ref<MonthlyGoal | null>(null);
const historyGoalId = ref<string | null>(null);
const historyQuery = useSupervisionGoalHistoryQuery(historyGoalId);

const sellerById = computed(() => {
  const map = new Map<string, { presented: number; name: string }>();
  for (const s of sellersQuery.data.value?.items ?? []) {
    map.set(s.sellerId, {
      presented: s.salesPresented,
      name: `${s.lastName}, ${s.firstName}`,
    });
  }
  return map;
});

const teamNameById = computed(() => {
  const map = new Map<string, string>();
  for (const team of teamsQuery.data.value?.items ?? []) {
    map.set(team.id, team.name);
  }
  return map;
});

const rows = computed(() =>
  (goalsQuery.data.value?.items ?? []).map((goal) => {
    const seller = goal.userId ? sellerById.value.get(goal.userId) : null;
    const actual =
      goal.goalType === 'SALES_SUBMITTED' && goal.targetType === 'USER'
        ? (seller?.presented ?? null)
        : goal.goalType === 'SALES_SUBMITTED' && goal.targetType === 'TEAM'
          ? (sellersQuery.data.value?.items ?? [])
              .filter((s) => s.teamId === goal.teamId)
              .reduce((sum, s) => sum + s.salesPresented, 0)
          : null;
    const compliance =
      actual === null || goal.targetValue === 0 ? null : (actual / goal.targetValue) * 100;
    const delta = actual === null ? null : actual - goal.targetValue;
    return {
      goal,
      actual,
      compliance,
      delta,
      subjectLabel: subjectLabel(goal, seller?.name),
    };
  }),
);

function subjectLabel(goal: MonthlyGoal, sellerName?: string): string {
  if (goal.targetType === 'TEAM') {
    if (goal.teamId && teamNameById.value.has(goal.teamId)) {
      return teamNameById.value.get(goal.teamId)!;
    }
    return goal.teamId ? `Equipo ${goal.teamId.slice(0, 8)}…` : 'Equipo';
  }
  return sellerName ?? (goal.userId ? `Usuario ${goal.userId.slice(0, 8)}…` : 'Usuario');
}

function goalTypeLabel(type: string): string {
  return GOAL_TYPE_OPTIONS.find((g) => g.value === type)?.title ?? type;
}

function monthLabel(m: number): string {
  return MONTH_OPTIONS.find((x) => x.value === m)?.title ?? String(m);
}

function openCreate(): void {
  editing.value = null;
  dialogOpen.value = true;
}

function openEdit(goal: MonthlyGoal): void {
  editing.value = goal;
  dialogOpen.value = true;
}

function openHistory(goal: MonthlyGoal): void {
  historyGoalId.value = goal.id;
}
</script>

<template>
  <div data-testid="supervision-goals">
    <PageHeader
      title="Objetivos mensuales"
      subtitle="Metas independientes por equipo o persona. Sin objetivo no se inventa un 0%."
    >
      <template v-if="canManage" #actions>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openCreate">Nuevo objetivo</v-btn>
      </template>
    </PageHeader>

    <SupervisionPeriodFilters v-model:year="year" v-model:month="month" v-model:team-id="teamId" />

    <ErrorState
      v-if="goalsQuery.error.value"
      :message="apiErrorMessage(goalsQuery.error.value)"
      :request-id="isApiError(goalsQuery.error.value) ? goalsQuery.error.value.requestId : null"
      :loading="goalsQuery.isFetching.value"
      @retry="goalsQuery.refetch()"
    />

    <EmptyState
      v-else-if="!goalsQuery.isLoading.value && rows.length === 0"
      title="Sin objetivos"
      text="No hay objetivos cargados para este período y alcance."
    />

    <v-card v-else>
      <v-data-table
        :items="rows"
        :loading="goalsQuery.isFetching.value"
        :headers="[
          { title: 'Período', key: 'period' },
          { title: 'Métrica', key: 'metric' },
          { title: 'Sujeto', key: 'subject' },
          { title: 'Objetivo', key: 'target' },
          { title: 'Real', key: 'actual' },
          { title: 'Cumplimiento', key: 'compliance' },
          { title: 'Diferencia', key: 'delta' },
          { title: '', key: 'actions', sortable: false, align: 'end' },
        ]"
        hover
      >
        <template #[`item.period`]="{ item }">
          {{ monthLabel(item.goal.month) }} {{ item.goal.year }}
        </template>
        <template #[`item.metric`]="{ item }">
          {{ goalTypeLabel(item.goal.goalType) }}
        </template>
        <template #[`item.subject`]="{ item }">
          {{ item.subjectLabel }}
        </template>
        <template #[`item.target`]="{ item }">
          {{ item.goal.targetValue }}
        </template>
        <template #[`item.actual`]="{ item }">
          {{ item.actual === null ? '—' : item.actual }}
        </template>
        <template #[`item.compliance`]="{ item }">
          <span v-if="item.compliance === null">Sin dato / Sin objetivo aplicable</span>
          <span v-else>{{ Math.round(item.compliance) }}%</span>
        </template>
        <template #[`item.delta`]="{ item }">
          {{ item.delta === null ? '—' : item.delta > 0 ? `+${item.delta}` : item.delta }}
        </template>
        <template #[`item.actions`]="{ item }">
          <v-btn variant="text" size="small" @click="openHistory(item.goal)">Historial</v-btn>
          <v-btn v-if="canManage" variant="text" size="small" @click="openEdit(item.goal)">
            Editar
          </v-btn>
        </template>
      </v-data-table>
    </v-card>

    <GoalFormDialog
      v-model="dialogOpen"
      :goal="editing"
      :default-year="year"
      :default-month="month"
      @saved="goalsQuery.refetch()"
    />

    <v-dialog
      :model-value="Boolean(historyGoalId)"
      max-width="560"
      @update:model-value="(v) => !v && (historyGoalId = null)"
    >
      <v-card title="Historial del objetivo">
        <v-card-text>
          <ErrorState
            v-if="historyQuery.error.value"
            :message="apiErrorMessage(historyQuery.error.value)"
            @retry="historyQuery.refetch()"
          />
          <v-list v-else-if="historyQuery.data.value?.items.length" density="comfortable">
            <v-list-item
              v-for="row in historyQuery.data.value.items"
              :key="row.id"
              :title="`${row.previousValue ?? '—'} ? ${row.newValue}`"
              :subtitle="`${formatDateTime(row.changedAt)}${row.reason ? ` · ${row.reason}` : ''}`"
            />
          </v-list>
          <p v-else class="text-medium-emphasis mb-0">Sin cambios registrados.</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="historyGoalId = null">Cerrar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
