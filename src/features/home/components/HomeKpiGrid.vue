<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';
import { useRouter } from 'vue-router';
import type { HomeKpi } from '@/services/http';
import KpiMetricCard from '@/features/supervision/components/KpiMetricCard.vue';
import { formatHomeKpiHint, formatHomeKpiValue, homeKpiIcon } from '../utils/home-labels';

const props = defineProps<{
  kpis: readonly HomeKpi[];
  resolveRoute?: (code: string) => RouteLocationRaw | null;
}>();

const router = useRouter();

function onClick(kpi: HomeKpi): void {
  const to = props.resolveRoute?.(kpi.code) ?? null;
  if (to) void router.push(to);
}

function isClickable(kpi: HomeKpi): boolean {
  return Boolean(props.resolveRoute?.(kpi.code));
}
</script>

<template>
  <v-row dense class="mb-2">
    <v-col v-for="kpi in kpis" :key="kpi.code" cols="12" sm="6" lg="3" class="d-flex">
      <KpiMetricCard
        class="flex-grow-1 w-100"
        :title="kpi.label"
        :value="formatHomeKpiValue(kpi)"
        :hint="formatHomeKpiHint(kpi)"
        :icon="homeKpiIcon(kpi.code)"
        :clickable="isClickable(kpi)"
        data-testid="home-kpi-card"
        @click="onClick(kpi)"
      />
    </v-col>
  </v-row>
</template>
