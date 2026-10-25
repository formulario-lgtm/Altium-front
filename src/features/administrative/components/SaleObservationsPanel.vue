<script setup lang="ts">
import { computed, ref } from 'vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { apiErrorMessage, type SaleObservation } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import { formatDateTime } from '@/utils/format';
import {
  useCreateSaleObservationMutation,
  useResolveSaleObservationMutation,
  useSaleObservationsQuery,
} from '../composables/useAdministrative';
import { observationStatusLabel, observationTypeLabel } from '@/features/sales/utils/sale-labels';

const props = defineProps<{
  saleId: string;
  /** When true, show create-internal-note controls. */
  canObserve?: boolean;
  /** When true, allow resolve on open correction requests. */
  canResolve?: boolean;
}>();

const auth = useAuthStore();
const observationsQuery = useSaleObservationsQuery(() => props.saleId);
const createMutation = useCreateSaleObservationMutation();
const resolveMutation = useResolveSaleObservationMutation();

const noteDraft = ref('');
const actionError = ref<string | null>(null);

const items = computed(() => observationsQuery.data.value?.items ?? []);
const internalNotes = computed(() => items.value.filter((row) => row.type === 'INTERNAL_NOTE'));
const corrections = computed(() => items.value.filter((row) => row.type === 'CORRECTION_REQUEST'));

async function createInternalNote(): Promise<void> {
  const description = noteDraft.value.trim();
  if (description.length < 3) {
    actionError.value = 'La nota debe tener al menos 3 caracteres.';
    return;
  }
  actionError.value = null;
  try {
    await createMutation.mutateAsync({
      id: props.saleId,
      body: { type: 'INTERNAL_NOTE', description },
    });
    noteDraft.value = '';
  } catch (error: unknown) {
    actionError.value = apiErrorMessage(error);
  }
}

async function resolve(observation: SaleObservation): Promise<void> {
  actionError.value = null;
  try {
    await resolveMutation.mutateAsync({
      id: props.saleId,
      observationId: observation.id,
    });
  } catch (error: unknown) {
    actionError.value = apiErrorMessage(error);
  }
}
</script>

<template>
  <div>
    <v-alert
      v-if="actionError"
      type="error"
      variant="tonal"
      class="mb-4"
      density="compact"
      closable
      @click:close="actionError = null"
    >
      {{ actionError }}
    </v-alert>

    <v-progress-linear
      v-if="observationsQuery.isLoading.value"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <section class="mb-6">
      <h3 class="text-subtitle-1 font-weight-bold mb-3">Solicitudes de corrección</h3>
      <v-card v-for="obs in corrections" :key="obs.id" class="mb-3 pa-4" variant="outlined" border>
        <div class="d-flex flex-wrap align-center justify-space-between ga-2 mb-2">
          <div class="d-flex flex-wrap align-center ga-2">
            <v-chip size="small" color="warning" variant="tonal">
              {{ observationTypeLabel(obs.type) }}
            </v-chip>
            <StatusBadge :status="obs.status" :label="observationStatusLabel(obs.status)" />
          </div>
          <span class="text-caption text-medium-emphasis">{{ formatDateTime(obs.createdAt) }}</span>
        </div>
        <p class="mb-2">{{ obs.description }}</p>
        <div class="d-flex flex-wrap align-center justify-space-between ga-2">
          <span class="text-caption text-medium-emphasis">Autor: {{ obs.authorUserId }}</span>
          <v-btn
            v-if="canResolve && obs.status === 'OPEN' && auth.hasPermission('sales.observe')"
            size="small"
            variant="tonal"
            :loading="
              resolveMutation.isPending.value &&
              resolveMutation.variables.value?.observationId === obs.id
            "
            @click="resolve(obs)"
          >
            Resolver
          </v-btn>
        </div>
      </v-card>
      <p v-if="!corrections.length" class="text-medium-emphasis mb-0">
        No hay solicitudes de corrección.
      </p>
    </section>

    <section v-if="auth.hasPermission('sales.observe') || auth.hasPermission('sales.review')">
      <h3 class="text-subtitle-1 font-weight-bold mb-3">Notas internas</h3>
      <v-alert
        type="info"
        variant="tonal"
        density="compact"
        class="mb-3"
        text="Solo visibles para el equipo administrativo. No se muestran al vendedor."
      />
      <v-card
        v-for="obs in internalNotes"
        :key="obs.id"
        class="mb-3 pa-4"
        variant="tonal"
        color="primary"
      >
        <div class="d-flex flex-wrap align-center justify-space-between ga-2 mb-2">
          <v-chip size="small" variant="flat">{{ observationTypeLabel(obs.type) }}</v-chip>
          <span class="text-caption">{{ formatDateTime(obs.createdAt) }}</span>
        </div>
        <p class="mb-1">{{ obs.description }}</p>
        <span class="text-caption text-medium-emphasis">Autor: {{ obs.authorUserId }}</span>
      </v-card>
      <p v-if="!internalNotes.length" class="text-medium-emphasis mb-4">Sin notas internas.</p>

      <div v-if="canObserve" class="mt-2">
        <v-textarea
          v-model="noteDraft"
          label="Nueva nota interna"
          rows="3"
          maxlength="2000"
          counter
        />
        <v-btn
          color="primary"
          variant="tonal"
          class="mt-2"
          :loading="createMutation.isPending.value"
          @click="createInternalNote"
        >
          Guardar nota
        </v-btn>
      </div>
    </section>
  </div>
</template>
