<script setup lang="ts">
import { computed } from 'vue';
import type { SaleStatus, SaleStatusHistory } from '@/services/http';
import { formatDateTime } from '@/utils/format';

const props = defineProps<{
  status: SaleStatus;
  history?: SaleStatusHistory;
  loading?: boolean;
  error?: boolean;
}>();
defineEmits<{ retry: [] }>();
const closed = computed(() => props.status === 'APPROVED' || props.status === 'REJECTED');
const resolution = computed(
  () =>
    [...(props.history?.items ?? [])]
      .filter((entry) => entry.toStatus === props.status)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0],
);
</script>

<template>
  <v-alert
    v-if="closed"
    :type="status === 'APPROVED' ? 'success' : 'error'"
    :title="
      status === 'APPROVED' ? 'Venta aprobada por la prepaga' : 'Venta rechazada por la prepaga'
    "
    class="mb-4"
    data-testid="sale-resolution"
  >
    <p class="text-body-2 mt-1 mb-0">La gestión de esta venta finalizó.</p>
    <p v-if="resolution?.reason" class="text-body-2 mt-3 mb-0 sale-resolution-reason">
      <strong>{{ status === 'REJECTED' ? 'Motivo del rechazo: ' : 'Nota: ' }}</strong
      >{{ resolution.reason }}
    </p>
    <p v-if="resolution" class="text-caption mt-3 mb-0">
      Registrada el {{ formatDateTime(resolution.createdAt) }} por
      {{ resolution.changedBy.firstName }} {{ resolution.changedBy.lastName }}.
    </p>
    <p v-else-if="loading" class="text-body-2 mt-2 mb-0">Cargando detalle de la resolución…</p>
    <div v-if="error" class="mt-2">
      <p class="text-body-2 mb-1">No pudimos cargar el motivo y los datos de la resolución.</p>
      <v-btn variant="text" size="small" @click="$emit('retry')">Reintentar resolución</v-btn>
    </div>
  </v-alert>
</template>

<style scoped>
.sale-resolution-reason {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
