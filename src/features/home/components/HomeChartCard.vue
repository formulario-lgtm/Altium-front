<script setup lang="ts">
import type { EChartsCoreOption } from 'echarts/core';
import EmptyState from '@/components/common/EmptyState.vue';
import AltiumChart from '@/features/supervision/components/AltiumChart.vue';
import HomePanel from './HomePanel.vue';

withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    option: EChartsCoreOption | null;
    hasData: boolean;
    height?: string;
    emptyTitle?: string;
    emptyText?: string;
    loading?: boolean;
  }>(),
  {
    subtitle: undefined,
    height: '280px',
    emptyTitle: 'Sin datos',
    emptyText: 'No hay series para el período seleccionado.',
    loading: false,
  },
);
</script>

<template>
  <HomePanel :title="title" :subtitle="subtitle" class="flex-grow-1" data-testid="home-chart-card">
    <template v-if="$slots.actions" #actions><slot name="actions" /></template>
    <slot name="summary" />
    <v-skeleton-loader v-if="loading" type="image" />
    <EmptyState
      v-else-if="!hasData || !option"
      :title="emptyTitle"
      :text="emptyText"
      icon="mdi-chart-line-variant"
      compact
    />
    <div v-else class="home-chart-card__plot" :style="{ minHeight: height }">
      <AltiumChart :option="option" height="100%" :aria-label="title" />
    </div>
  </HomePanel>
</template>

<style scoped lang="scss">
.home-chart-card__plot {
  position: relative;
  flex: 1 1 auto;
  :deep(.altium-chart) {
    position: absolute;
    inset: 0;
  }
}
</style>
