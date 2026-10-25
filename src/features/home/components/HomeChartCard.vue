<script setup lang="ts">
import type { EChartsCoreOption } from 'echarts/core';
import EmptyState from '@/components/common/EmptyState.vue';
import AltiumChart from '@/features/supervision/components/AltiumChart.vue';

withDefaults(
  defineProps<{
    title: string;
    subtitle?: string;
    option: EChartsCoreOption | null;
    hasData: boolean;
    height?: string;
    emptyTitle?: string;
    emptyText?: string;
  }>(),
  {
    subtitle: undefined,
    height: '280px',
    emptyTitle: 'Sin datos',
    emptyText: 'No hay series para el período seleccionado.',
  },
);
</script>

<template>
  <v-card class="h-100 d-flex flex-column" data-testid="home-chart-card">
    <v-card-item :title="title" :subtitle="subtitle || '\u00A0'" />
    <v-card-text class="flex-grow-1">
      <EmptyState
        v-if="!hasData || !option"
        :title="emptyTitle"
        :text="emptyText"
        icon="mdi-chart-line-variant"
        compact
      />
      <AltiumChart v-else :option="option" :height="height" />
    </v-card-text>
  </v-card>
</template>
