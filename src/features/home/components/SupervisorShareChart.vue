<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';
import EmptyState from '@/components/common/EmptyState.vue';
import AltiumChart from '@/features/supervision/components/AltiumChart.vue';
import { paletteFromTheme } from '../utils/home-charts';
import { buildSupervisorShareOption, type SupervisorShare } from '../utils/supervisor-charts';
const props = defineProps<{ items: SupervisorShare[]; label: string; emptyText: string }>();
const theme = useTheme();
const hasData = computed(() => props.items.some((item) => item.value > 0));
const option = computed(() =>
  buildSupervisorShareOption(props.items, paletteFromTheme(theme.global.current.value.dark)),
);
</script>
<template>
  <AltiumChart v-if="hasData" :option="option" height="260px" role="img" :aria-label="label" />
  <EmptyState
    v-else
    title="Sin movimientos este mes"
    :text="emptyText"
    icon="mdi-chart-donut"
    compact
  />
</template>
