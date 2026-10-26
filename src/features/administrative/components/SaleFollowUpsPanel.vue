<script setup lang="ts">
import DateField from '@/components/common/DateField.vue';
import { computed, ref } from 'vue';
import { apiErrorMessage, type SaleFollowUpType } from '@/services/http';
import { formatDateTime } from '@/utils/format';
import {
  useCreateSaleFollowUpMutation,
  useSaleFollowUpsQuery,
} from '../composables/useAdministrative';
import { FOLLOW_UP_TYPE_OPTIONS, followUpTypeLabel } from '@/features/sales/utils/sale-labels';

const props = defineProps<{
  saleId: string;
  canCreate?: boolean;
}>();

const followUpsQuery = useSaleFollowUpsQuery(() => props.saleId);
const createMutation = useCreateSaleFollowUpMutation();

const followUpType = ref<SaleFollowUpType>('CALL');
const description = ref('');
const occurredAt = ref(new Date().toISOString().slice(0, 16));
const nextFollowUpAt = ref<string | null>(null);
const actionError = ref<string | null>(null);

const items = computed(() => {
  const rows = [...(followUpsQuery.data.value?.items ?? [])];
  return rows.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
});

function isOverdue(value: string | null | undefined): boolean {
  if (!value) return false;
  return new Date(value).getTime() < Date.now();
}

async function createFollowUp(): Promise<void> {
  const text = description.value.trim();
  if (text.length < 3) {
    actionError.value = 'La descripción debe tener al menos 3 caracteres.';
    return;
  }
  if (!occurredAt.value) {
    actionError.value = 'Indicá la fecha de la gestión.';
    return;
  }
  actionError.value = null;
  try {
    await createMutation.mutateAsync({
      id: props.saleId,
      body: {
        followUpType: followUpType.value,
        description: text,
        occurredAt: new Date(occurredAt.value).toISOString(),
        nextFollowUpAt: nextFollowUpAt.value ? new Date(nextFollowUpAt.value).toISOString() : null,
      },
    });
    description.value = '';
    nextFollowUpAt.value = null;
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
      v-if="followUpsQuery.isLoading.value"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <v-card
      v-for="row in items"
      :key="row.id"
      class="mb-3 pa-4"
      :variant="isOverdue(row.nextFollowUpAt) ? 'tonal' : 'outlined'"
      :color="isOverdue(row.nextFollowUpAt) ? 'warning' : undefined"
      border
    >
      <div class="d-flex flex-wrap align-center justify-space-between ga-2 mb-2">
        <v-chip size="small" variant="tonal">{{ followUpTypeLabel(row.followUpType) }}</v-chip>
        <span class="text-caption text-medium-emphasis">{{ formatDateTime(row.occurredAt) }}</span>
      </div>
      <p class="mb-2">{{ row.description }}</p>
      <p v-if="row.nextFollowUpAt" class="text-body-2 mb-0">
        Próximo seguimiento:
        <strong :class="{ 'text-warning': isOverdue(row.nextFollowUpAt) }">
          {{ formatDateTime(row.nextFollowUpAt) }}
        </strong>
      </p>
    </v-card>

    <p v-if="!items.length" class="text-medium-emphasis mb-4">Sin gestiones registradas.</p>

    <v-card v-if="canCreate" class="pa-4 mt-2" variant="outlined" border>
      <h3 class="text-subtitle-1 font-weight-bold mb-3">Registrar gestión</h3>
      <v-row dense>
        <v-col cols="12" sm="6">
          <v-select v-model="followUpType" :items="FOLLOW_UP_TYPE_OPTIONS" label="Tipo" />
        </v-col>
        <v-col cols="12" sm="6">
          <DateField v-model="occurredAt" type="datetime-local" label="Fecha de la gestión" />
        </v-col>
        <v-col cols="12">
          <v-textarea v-model="description" label="Descripción" rows="3" maxlength="2000" counter />
        </v-col>
        <v-col cols="12" sm="6">
          <DateField
            v-model="nextFollowUpAt"
            type="datetime-local"
            label="Próximo seguimiento (opcional)"
            clearable
          />
        </v-col>
      </v-row>
      <v-btn
        color="primary"
        class="mt-2"
        :loading="createMutation.isPending.value"
        @click="createFollowUp"
      >
        Guardar seguimiento
      </v-btn>
    </v-card>
  </div>
</template>
