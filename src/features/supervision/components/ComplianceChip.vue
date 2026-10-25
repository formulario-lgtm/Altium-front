<script setup lang="ts">
import { computed } from 'vue';
import type { SupervisionCompliance } from '@/services/http';
import { formatCompliance } from '../utils/supervision-labels';

const props = defineProps<{
  compliance: SupervisionCompliance | null | undefined;
}>();

const label = computed(() => formatCompliance(props.compliance));

const color = computed(() => {
  if (!props.compliance?.hasGoal || props.compliance.targetIsZero) return undefined;
  const pct = props.compliance.compliancePercent ?? 0;
  if (pct >= 100) return 'success';
  if (pct >= 70) return 'warning';
  return 'error';
});
</script>

<template>
  <v-chip
    :color="color"
    :variant="color ? 'tonal' : 'outlined'"
    size="small"
    label
    :aria-label="`Cumplimiento: ${label}`"
  >
    <v-icon
      v-if="compliance?.hasGoal && !compliance.targetIsZero"
      start
      :icon="
        (compliance.compliancePercent ?? 0) >= 100
          ? 'mdi-check-circle'
          : (compliance.compliancePercent ?? 0) >= 70
            ? 'mdi-alert-circle'
            : 'mdi-close-circle'
      "
      size="16"
    />
    {{ label }}
  </v-chip>
</template>
