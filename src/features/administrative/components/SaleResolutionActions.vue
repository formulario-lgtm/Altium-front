<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQueryClient } from '@tanstack/vue-query';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import { apiErrorMessage, isApiError, type Sale, type ResolveSaleBody } from '@/services/http';
import { queryKeys } from '@/services/http/query-keys';
import { useAuthStore } from '@/stores/auth.store';
import { useResolveSaleMutation } from '../composables/useAdministrative';

const props = defineProps<{ sale: Sale }>();
const auth = useAuthStore();
const mutation = useResolveSaleMutation();
const client = useQueryClient();
const decisionVersion = ref(props.sale.version);
const conflict = ref(false);
const decision = ref<ResolveSaleBody['status']>('APPROVED');
const open = ref(false);
const reason = ref('');
const error = ref<string | null>(null);
const canResolve = computed(
  () =>
    auth.hasPermission('sales.review') && ['SUBMITTED', 'IN_REVIEW'].includes(props.sale.status),
);
const rejecting = computed(() => decision.value === 'REJECTED');

function start(status: ResolveSaleBody['status']) {
  decision.value = status;
  decisionVersion.value = props.sale.version;
  conflict.value = false;
  reason.value = '';
  error.value = null;
  open.value = true;
}
async function resolve() {
  if (!canResolve.value || mutation.isPending.value) return;
  const note = reason.value.trim();
  if (
    (rejecting.value && note.length < 3) ||
    note.length > 2000 ||
    (note.length > 0 && note.length < 3)
  ) {
    error.value = 'Indicá un motivo de entre 3 y 2000 caracteres.';
    return;
  }
  error.value = null;
  try {
    await mutation.mutateAsync({
      id: props.sale.id,
      body: {
        status: decision.value,
        version: decisionVersion.value,
        ...(note ? { reason: note } : {}),
      },
    });
    open.value = false;
  } catch (cause) {
    error.value = apiErrorMessage(cause);
    conflict.value = isApiError(cause) && cause.code === 'VERSION_CONFLICT';
  }
}

async function reviewCurrentVersion() {
  open.value = false;
  await client.invalidateQueries({ queryKey: queryKeys.sales.detail(props.sale.id) });
}
</script>

<template>
  <template v-if="canResolve">
    <v-btn
      color="success"
      variant="tonal"
      prepend-icon="mdi-check-circle-outline"
      :disabled="mutation.isPending.value"
      @click="start('APPROVED')"
      >Aprobar</v-btn
    >
    <v-btn
      color="error"
      variant="tonal"
      prepend-icon="mdi-close-circle-outline"
      :disabled="mutation.isPending.value"
      @click="start('REJECTED')"
      >Rechazar</v-btn
    >
  </template>
  <ConfirmDialog
    v-model="open"
    :title="rejecting ? 'Registrar rechazo de la prepaga' : 'Registrar aprobación de la prepaga'"
    :message="
      rejecting
        ? 'La venta quedará rechazada y la gestión finalizará. El vendedor recibirá una notificación y podrá consultar el motivo.'
        : 'Confirmá que la prepaga aceptó la venta. La gestión finalizará y se notificará al vendedor.'
    "
    :confirm-text="rejecting ? 'Confirmar rechazo' : 'Confirmar aprobación'"
    :color="rejecting ? 'error' : 'primary'"
    :loading="mutation.isPending.value"
    :error-message="error"
    @confirm="resolve"
  >
    <v-textarea
      v-model="reason"
      class="mt-4"
      :label="rejecting ? 'Motivo del rechazo *' : 'Nota de aprobación (opcional)'"
      :required="rejecting"
      rows="3"
      maxlength="2000"
      counter
      :hint="
        rejecting
          ? 'Explicá por qué la prepaga rechazó la venta. Será visible para el vendedor.'
          : 'La nota quedará visible en el historial.'
      "
      persistent-hint
    />
    <v-btn v-if="conflict" class="mt-3" variant="tonal" @click="reviewCurrentVersion"
      >Revisar versión actual</v-btn
    >
    <p class="text-caption text-medium-emphasis mt-3 mb-0">
      Se cerrarán los seguimientos pendientes. La venta quedará disponible para consulta, sin opción
      de reabrirla.
    </p>
  </ConfirmDialog>
</template>
