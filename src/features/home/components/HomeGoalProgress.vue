<script setup lang="ts">
import { MONTHLY_GOALS_ENABLED } from '@/config/features';
import { computed } from 'vue';
import type { HomeCompliance } from '@/services/http';
import { formatHomeCompliance } from '../utils/home-labels';

const props = defineProps<{ compliance: HomeCompliance; label?: string }>();
const usable = computed(
  () =>
    props.compliance.hasGoal &&
    !props.compliance.targetIsZero &&
    (props.compliance.targetValue ?? 0) > 0 &&
    props.compliance.compliancePercent != null,
);
const progress = computed(() =>
  Math.min(100, Math.max(0, props.compliance.compliancePercent ?? 0)),
);
</script>

<template>
  <div v-if="MONTHLY_GOALS_ENABLED" class="mb-4" data-testid="home-goal-progress">
    <div class="d-flex flex-wrap align-baseline justify-space-between ga-2 mb-2">
      <span class="text-h5 font-weight-bold">{{
        compliance.hasGoal && !compliance.targetIsZero && compliance.compliancePercent == null
          ? 'Sin datos'
          : formatHomeCompliance(compliance)
      }}</span>
      <span v-if="compliance.hasGoal" class="text-body-2 text-medium-emphasis"
        >{{ label ?? 'Objetivo mensual' }}: {{ compliance.targetValue ?? '—' }} ventas</span
      >
    </div>
    <v-progress-linear
      v-if="usable"
      :model-value="progress"
      color="primary"
      height="8"
      rounded
      :aria-label="label ?? 'Cumplimiento mensual'"
    />
    <p class="text-body-2 text-medium-emphasis mt-2 mb-0">
      {{
        !compliance.hasGoal
          ? 'Todavía no hay un objetivo configurado para este período.'
          : compliance.targetIsZero
            ? 'El objetivo está configurado en cero; no se calcula un porcentaje.'
            : !usable
              ? 'El cálculo de cumplimiento todavía no está disponible.'
              : (compliance.compliancePercent ?? 0) >= 100
                ? '¡Objetivo alcanzado! El equipo ya completó la meta del mes.'
                : 'Avance de las ventas presentadas sobre el objetivo mensual.'
      }}
    </p>
  </div>
</template>
