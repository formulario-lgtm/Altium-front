<script setup lang="ts">
import { computed } from 'vue';
import { useTheme } from 'vuetify';
import type { SellerHome } from '@/services/http';
import AltiumChart from '@/features/supervision/components/AltiumChart.vue';
import { buildSellerPresentedOption, paletteFromTheme, seriesHasData } from '../utils/home-charts';
import { formatHomeCompliance } from '../utils/home-labels';

const props = defineProps<{ home: SellerHome; period: string }>();
const theme = useTheme();
const usableGoal = computed(
  () =>
    props.home.compliance.hasGoal &&
    (props.home.compliance.targetValue ?? 0) > 0 &&
    props.home.compliance.compliancePercent != null,
);
const progress = computed(() =>
  Math.min(100, Math.max(0, props.home.compliance.compliancePercent ?? 0)),
);
const hasData = computed(() => seriesHasData(props.home.dailyPresented));
const option = computed(() =>
  buildSellerPresentedOption(
    props.home.dailyPresented,
    paletteFromTheme(theme.global.current.value.dark),
  ),
);
</script>

<template>
  <v-card
    tag="section"
    aria-labelledby="seller-progress-title"
    data-testid="seller-progress"
    class="d-flex flex-column"
  >
    <v-card-text class="d-flex flex-column flex-grow-1">
      <div class="d-flex align-start justify-space-between ga-3 mb-4">
        <div>
          <h2 id="seller-progress-title" class="text-h6">Tu avance del mes</h2>
          <p class="text-body-2 text-medium-emphasis mb-0">{{ period }}</p>
        </div>
        <v-avatar color="primary" variant="tonal" rounded="lg" size="40"
          ><v-icon icon="mdi-target"
        /></v-avatar>
      </div>
      <template v-if="usableGoal">
        <div class="d-flex align-baseline justify-space-between ga-2 mb-2">
          <span class="text-h5 font-weight-bold">{{ formatHomeCompliance(home.compliance) }}</span>
          <span class="text-body-2 text-medium-emphasis"
            >Objetivo: {{ home.compliance.targetValue }} ventas</span
          >
        </div>
        <v-progress-linear
          :model-value="progress"
          color="primary"
          height="8"
          rounded
          aria-label="Cumplimiento del objetivo mensual"
        />
        <p class="text-body-2 text-medium-emphasis mt-2 mb-0">
          {{
            home.remainingToGoal === 0
              ? '¡Alcanzaste tu objetivo mensual!'
              : home.remainingToGoal != null
                ? `Te ${home.remainingToGoal === 1 ? 'falta 1 venta' : `faltan ${home.remainingToGoal} ventas`} para alcanzar tu objetivo.`
                : 'Seguí tu avance con cada venta presentada.'
          }}
        </p>
      </template>
      <div v-else>
        <p class="text-subtitle-2 mb-1">
          {{
            home.compliance.targetIsZero
              ? 'Objetivo mensual en cero'
              : home.compliance.hasGoal
                ? 'Avance no disponible'
                : 'Sin objetivo mensual'
          }}
        </p>
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{
            home.compliance.targetIsZero
              ? 'Tu objetivo está configurado en cero.'
              : home.compliance.hasGoal
                ? 'Todavía no está disponible el cálculo de cumplimiento.'
                : 'Tu supervisor puede configurar el objetivo de este mes.'
          }}
          Mientras tanto, cada venta cuenta.
        </p>
      </div>
      <v-divider class="my-4" />
      <div class="d-flex flex-wrap align-center justify-space-between ga-2">
        <h3 class="text-subtitle-2">Presentadas por día</h3>
        <span class="text-caption text-medium-emphasis"
          >{{ home.presentedToday }} presentadas hoy</span
        >
      </div>
      <div v-if="hasData" class="seller-progress__chart" data-testid="seller-daily-chart">
        <AltiumChart
          :option="option"
          height="100%"
          aria-label="Ventas presentadas por día del mes"
        />
      </div>
      <p v-else class="text-body-2 text-medium-emphasis mt-3 mb-0">
        Todavía no hay ventas presentadas este mes. Acá vas a ver tu evolución.
      </p>
    </v-card-text>
  </v-card>
</template>

<style scoped lang="scss">
.seller-progress__chart {
  position: relative;
  flex: 1 1 auto;
  min-height: 180px;

  :deep(.altium-chart) {
    position: absolute;
    inset: 0;
  }
}
</style>
