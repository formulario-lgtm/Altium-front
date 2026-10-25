<script setup lang="ts">
import { computed } from 'vue';

type BadgeDefinition = { label: string; color: string; icon: string };

/** Known status codes from the API contract (UserStatus, AuditOutcome) plus team activity. */
const DEFINITIONS: Record<string, BadgeDefinition> = {
  PENDING: { label: 'Pendiente', color: 'info', icon: 'mdi-clock-outline' },
  ACTIVE: { label: 'Activo', color: 'success', icon: 'mdi-check-circle-outline' },
  SUSPENDED: { label: 'Suspendido', color: 'warning', icon: 'mdi-pause-circle-outline' },
  DISABLED: { label: 'Deshabilitado', color: 'error', icon: 'mdi-cancel' },
  INACTIVE: { label: 'Inactivo', color: 'secondary', icon: 'mdi-minus-circle-outline' },
  SUCCESS: { label: 'Éxito', color: 'success', icon: 'mdi-check' },
  FAILURE: { label: 'Fallo', color: 'error', icon: 'mdi-alert-circle-outline' },
};

const props = withDefaults(defineProps<{ status: string; label?: string }>(), {
  label: undefined,
});

const definition = computed<BadgeDefinition>(
  () =>
    DEFINITIONS[props.status] ?? {
      label: props.status,
      color: 'secondary',
      icon: 'mdi-circle-small',
    },
);
</script>

<template>
  <v-chip
    :color="definition.color"
    :prepend-icon="definition.icon"
    :data-status="status"
    variant="tonal"
    label
  >
    {{ label ?? definition.label }}
  </v-chip>
</template>
