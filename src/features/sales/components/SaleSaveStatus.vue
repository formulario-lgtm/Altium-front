<script setup lang="ts">
import type { SaveStatus } from '../composables/useSaleForm';

defineProps<{
  status: SaveStatus;
  errorMessage?: string | null;
}>();
</script>

<template>
  <div class="sale-save-status text-caption" role="status" aria-live="polite">
    <span v-if="status === 'dirty'" class="text-medium-emphasis">Cambios sin guardar</span>
    <span v-else-if="status === 'saving'" class="text-medium-emphasis">
      <v-progress-circular indeterminate size="12" width="2" class="me-1" />
      Guardando…
    </span>
    <span v-else-if="status === 'saved'" class="text-success">Guardado</span>
    <span v-else-if="status === 'error'" class="text-error">
      {{ errorMessage || 'Error al guardar' }}
    </span>
  </div>
</template>
