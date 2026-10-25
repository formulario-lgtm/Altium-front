<script setup lang="ts">
import * as echarts from 'echarts/core';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  MarkLineComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import type { EChartsCoreOption } from 'echarts/core';
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue';
import { useTheme } from 'vuetify';
import { chartPalette } from '../utils/chart-theme';

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  MarkLineComponent,
  CanvasRenderer,
]);

const props = defineProps<{
  option: EChartsCoreOption;
  height?: string;
}>();

const root = ref<HTMLElement | null>(null);
const chart = shallowRef<echarts.ECharts | null>(null);
const theme = useTheme();

function applyThemeOption(option: EChartsCoreOption): EChartsCoreOption {
  const palette = chartPalette(theme.global.current.value.dark);
  return {
    ...option,
    backgroundColor: 'transparent',
    textStyle: { color: palette.text, fontFamily: 'inherit' },
    tooltip: {
      ...(typeof option.tooltip === 'object' && option.tooltip ? option.tooltip : {}),
      backgroundColor: theme.global.current.value.dark ? '#0E1B35' : '#FFFFFF',
      borderColor: palette.border,
      textStyle: { color: palette.text },
    },
  };
}

function render(): void {
  if (!root.value) return;
  if (!chart.value) {
    chart.value = echarts.init(root.value, undefined, { renderer: 'canvas' });
  }
  chart.value.setOption(applyThemeOption(props.option), true);
}

onMounted(() => {
  render();
  window.addEventListener('resize', resize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize);
  chart.value?.dispose();
  chart.value = null;
});

function resize(): void {
  chart.value?.resize();
}

watch(
  () => props.option,
  () => render(),
  { deep: true },
);

watch(
  () => theme.global.current.value.dark,
  () => render(),
);
</script>

<template>
  <div
    ref="root"
    class="altium-chart"
    :style="{ height: height ?? '280px', width: '100%' }"
    role="img"
  />
</template>
