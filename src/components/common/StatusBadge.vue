<script setup lang="ts">
import { computed } from 'vue';

type BadgeDefinition = { label: string; color: string };

/** Known status codes from the API contract (UserStatus, AuditOutcome) plus team activity. */
const DEFINITIONS: Record<string, BadgeDefinition> = {
  PENDING: { label: 'Pendiente', color: 'info' },
  ACTIVE: { label: 'Activo', color: 'success' },
  SUSPENDED: { label: 'Suspendido', color: 'warning' },
  DISABLED: { label: 'Deshabilitado', color: 'error' },
  INACTIVE: { label: 'Inactivo', color: 'secondary' },
  SUCCESS: { label: 'Éxito', color: 'success' },
  FAILURE: { label: 'Fallo', color: 'error' },
  DRAFT: { label: 'Borrador', color: 'secondary' },
  SUBMITTED: { label: 'Presentada', color: 'success' },
  RETURNED: { label: 'Devuelta', color: 'warning' },
};

const props = withDefaults(defineProps<{ status: string; label?: string }>(), {
  label: undefined,
});

const definition = computed<BadgeDefinition>(
  () =>
    DEFINITIONS[props.status] ?? {
      label: props.status,
      color: 'secondary',
    },
);
</script>

<template>
  <v-chip
    class="altium-status-badge"
    :color="definition.color"
    :data-status="status"
    variant="tonal"
    size="small"
    rounded="pill"
  >
    <span class="altium-status-badge__dot" aria-hidden="true" />
    {{ label ?? definition.label }}
  </v-chip>
</template>

<style scoped lang="scss">
.altium-status-badge {
  font-weight: 600;
  letter-spacing: 0.01em;
}

.altium-status-badge__dot {
  display: inline-block;
  width: 0.45rem;
  height: 0.45rem;
  margin-right: 0.4rem;
  border-radius: 50%;
  background: currentColor;
  flex-shrink: 0;
}
</style>
