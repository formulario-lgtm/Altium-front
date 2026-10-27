<script setup lang="ts">
import { computed } from 'vue';
import { MONTHLY_GOALS_ENABLED, isGoalMetric } from '@/config/features';
import type { RouteLocationRaw } from 'vue-router';
import { useRouter } from 'vue-router';
import type { HomeKpi } from '@/services/http';
import KpiMetricCard from '@/features/supervision/components/KpiMetricCard.vue';
import { formatHomeKpiHint, formatHomeKpiValue, homeKpiIcon } from '../utils/home-labels';
import { useAuthStore } from '@/stores/auth.store';
import { accessibleHomeRoute } from '../utils/home-navigation';

const props = defineProps<{
  kpis: readonly HomeKpi[];
  resolveRoute?: (code: string) => RouteLocationRaw | null;
  compactMobile?: boolean;
}>();

const visibleKpis = computed(() =>
  props.kpis.filter((kpi) => MONTHLY_GOALS_ENABLED || !isGoalMetric(kpi.code)),
);
const router = useRouter();
const auth = useAuthStore();

function destination(kpi: HomeKpi): RouteLocationRaw | null {
  return accessibleHomeRoute(router, props.resolveRoute?.(kpi.code) ?? null, auth.hasPermission);
}

function onClick(kpi: HomeKpi): void {
  const to = destination(kpi);
  if (to) void router.push(to);
}

function isClickable(kpi: HomeKpi): boolean {
  return Boolean(destination(kpi));
}
</script>

<template>
  <v-row dense class="mb-2">
    <v-col
      v-for="kpi in visibleKpis"
      :key="kpi.code"
      :cols="compactMobile ? 6 : 12"
      sm="6"
      :lg="visibleKpis.length === 3 ? 4 : 3"
      class="d-flex"
    >
      <KpiMetricCard
        class="flex-grow-1 w-100"
        :title="kpi.label"
        :value="formatHomeKpiValue(kpi)"
        :hint="formatHomeKpiHint(kpi)"
        :icon="homeKpiIcon(kpi.code)"
        :clickable="isClickable(kpi)"
        :compact-mobile="compactMobile"
        data-testid="home-kpi-card"
        @click="onClick(kpi)"
      />
    </v-col>
  </v-row>
</template>
