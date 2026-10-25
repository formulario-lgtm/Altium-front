<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { apiErrorMessage, isApiError } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import { formatDateTime } from '@/utils/format';
import {
  useExportSaleMutation,
  useReturnSaleMutation,
  useSaleDocumentsQuery,
  useSaleHistoryQuery,
  useSaleQuery,
  useSubmitSaleMutation,
} from '../composables/useSales';
import {
  canEditSaleStatus,
  customerTypeLabel,
  memberTypeLabel,
  PAYMENT_METHOD_OPTIONS,
} from '../utils/sale-labels';

const route = useRoute();
const auth = useAuthStore();
const saleId = computed(() => String(route.params.id));

const saleQuery = useSaleQuery(saleId);
const historyQuery = useSaleHistoryQuery(saleId);
const documentsQuery = useSaleDocumentsQuery(saleId);
const submitMutation = useSubmitSaleMutation();
const returnMutation = useReturnSaleMutation();
const exportMutation = useExportSaleMutation();

const canUpdate = computed(() => auth.hasPermission('sales.update'));
/** Present uses the same backend permission as update (`sales.update`). */
const canSubmit = canUpdate;
/** Export is gated by `sales.read` on the API. */
const canExport = computed(() => auth.hasPermission('sales.read'));
const canReturn = computed(() => auth.hasPermission('sales.return'));
const sale = computed(() => saleQuery.data.value);
const editable = computed(() => canEditSaleStatus(sale.value?.status));
const canReturnSale = computed(() => canReturn.value && sale.value?.status === 'SUBMITTED');

const submitConfirm = ref(false);
const returnConfirm = ref(false);
const returnReason = ref('');
const actionError = ref<string | null>(null);

const paymentMethodLabel = computed(() => {
  const method = sale.value?.billing?.paymentMethod;
  return PAYMENT_METHOD_OPTIONS.find((option) => option.value === method)?.title ?? '—';
});

async function onSubmit(): Promise<void> {
  submitConfirm.value = false;
  actionError.value = null;
  try {
    await submitMutation.mutateAsync(saleId.value);
    await saleQuery.refetch();
    await historyQuery.refetch();
  } catch (error: unknown) {
    actionError.value = apiErrorMessage(error);
  }
}

async function onReturn(): Promise<void> {
  const reason = returnReason.value.trim();
  if (reason.length < 3) {
    actionError.value = 'Indicá un motivo de al menos 3 caracteres.';
    return;
  }
  returnConfirm.value = false;
  actionError.value = null;
  try {
    await returnMutation.mutateAsync({ id: saleId.value, body: { reason } });
    returnReason.value = '';
    await saleQuery.refetch();
    await historyQuery.refetch();
  } catch (error: unknown) {
    actionError.value = apiErrorMessage(error);
  }
}
</script>

<template>
  <div>
    <PageHeader
      :title="sale?.saleNumber ?? 'Detalle de venta'"
      :subtitle="sale ? `Prepaga: ${sale.healthInsurer?.name ?? '—'}` : 'Cargando…'"
    >
      <template #actions>
        <div class="d-flex flex-wrap ga-2">
          <StatusBadge v-if="sale" :status="sale.status" />
          <v-btn variant="text" :to="{ name: 'sales' }">Volver</v-btn>
          <v-btn
            v-if="canUpdate && editable"
            color="primary"
            variant="tonal"
            :to="{ name: 'sale-edit', params: { id: saleId } }"
          >
            Editar
          </v-btn>
          <v-btn
            v-if="canSubmit && editable"
            color="primary"
            :loading="submitMutation.isPending.value"
            @click="submitConfirm = true"
          >
            Presentar
          </v-btn>
          <v-btn
            v-if="canReturnSale"
            color="warning"
            variant="tonal"
            :loading="returnMutation.isPending.value"
            @click="returnConfirm = true"
          >
            Devolver
          </v-btn>
          <v-btn
            v-if="canExport && sale?.status === 'SUBMITTED'"
            variant="tonal"
            :loading="exportMutation.isPending.value"
            @click="exportMutation.mutate(saleId)"
          >
            Exportar Excel
          </v-btn>
        </div>
      </template>
    </PageHeader>

    <ErrorState
      v-if="saleQuery.error.value"
      :message="apiErrorMessage(saleQuery.error.value)"
      :request-id="isApiError(saleQuery.error.value) ? saleQuery.error.value.requestId : null"
      @retry="saleQuery.refetch()"
    />

    <v-progress-linear
      v-else-if="saleQuery.isLoading.value"
      indeterminate
      color="primary"
      class="mb-4"
    />

    <template v-else-if="sale">
      <v-alert
        v-if="actionError"
        type="error"
        variant="tonal"
        class="mb-4"
        :title="actionError"
        closable
        @click:close="actionError = null"
      />

      <v-alert
        v-if="sale.documentationPending"
        type="warning"
        variant="tonal"
        class="mb-4"
        title="Documentación pendiente de integración"
        text="La venta se presentó con documentación pendiente (entorno no productivo)."
      />

      <v-row dense>
        <v-col cols="12" md="8">
          <v-card class="pa-4 pa-md-6 mb-4">
            <h2 class="text-h6 mb-4">Resumen</h2>
            <v-row dense>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Tipo de venta</div>
                <div>{{ customerTypeLabel(sale.customerType) }}</div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Plan</div>
                <div>{{ sale.healthPlan?.name ?? '—' }}</div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Creada</div>
                <div>{{ formatDateTime(sale.createdAt) }}</div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Presentada</div>
                <div>{{ sale.submittedAt ? formatDateTime(sale.submittedAt) : '—' }}</div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Última modificación</div>
                <div>{{ formatDateTime(sale.updatedAt) }}</div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Vendedor</div>
                <div>{{ sale.seller.firstName }} {{ sale.seller.lastName }}</div>
              </v-col>
            </v-row>
          </v-card>

          <v-card class="pa-4 pa-md-6 mb-4">
            <h2 class="text-h6 mb-4">Integrantes</h2>
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>Rol</th>
                  <th>Nombre</th>
                  <th>CUIL</th>
                  <th>Edad</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in sale.members" :key="member.id">
                  <td>{{ memberTypeLabel(member.memberType) }}</td>
                  <td>
                    {{ [member.lastName, member.firstName].filter(Boolean).join(', ') || '—' }}
                  </td>
                  <td>{{ member.cuil ?? '—' }}</td>
                  <td>{{ member.age ?? '—' }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>

          <v-card class="pa-4 pa-md-6 mb-4">
            <h2 class="text-h6 mb-4">Contacto</h2>
            <v-row dense>
              <v-col cols="12" sm="6">
                {{ sale.contact?.areaCode ?? '' }} {{ sale.contact?.phone ?? '—' }}
              </v-col>
              <v-col cols="12" sm="6">{{ sale.contact?.email ?? '—' }}</v-col>
              <v-col cols="12">{{ sale.contact?.address ?? '—' }}</v-col>
              <v-col cols="12" sm="6">{{ sale.contact?.postalCode ?? '—' }}</v-col>
              <v-col cols="12" sm="6">{{ sale.contact?.province ?? '—' }}</v-col>
            </v-row>
          </v-card>

          <v-card v-if="sale.employment" class="pa-4 pa-md-6 mb-4">
            <h2 class="text-h6 mb-4">Situación laboral</h2>
            <div v-for="employer in sale.employment.employers" :key="employer.id" class="mb-1">
              CUIT: {{ employer.employerCuit }}
            </div>
            <div>Obra social: {{ sale.employment.currentInsurance ?? '—' }}</div>
            <div>Sueldo bruto: {{ sale.employment.grossSalary ?? '—' }}</div>
          </v-card>

          <v-card v-if="sale.taxInfo" class="pa-4 pa-md-6 mb-4">
            <h2 class="text-h6 mb-4">Situación impositiva</h2>
            <div>Categoría: {{ sale.taxInfo.monotaxCategory ?? '—' }}</div>
            <div>Obra social: {{ sale.taxInfo.currentInsurance ?? '—' }}</div>
          </v-card>

          <v-card class="pa-4 pa-md-6 mb-4">
            <h2 class="text-h6 mb-4">Cobranza</h2>
            <div>Forma de pago: {{ paymentMethodLabel }}</div>
            <div>
              Titular pagador:
              {{
                sale.billing?.holderIsPayer === true
                  ? 'Sí'
                  : sale.billing?.holderIsPayer === false
                    ? 'No'
                    : '—'
              }}
            </div>
            <div v-if="sale.billing?.cardLastFour">
              Tarjeta {{ sale.billing.cardBrand ?? '' }} **** {{ sale.billing.cardLastFour }}
            </div>
            <v-alert
              v-if="sale.billing?.cbuCapturePending"
              type="info"
              variant="tonal"
              class="mt-3"
              density="compact"
              text="Captura segura de CBU pendiente."
            />
          </v-card>

          <v-card v-if="sale.observations" class="pa-4 pa-md-6 mb-4">
            <h2 class="text-h6 mb-2">Observaciones</h2>
            <p class="mb-0">{{ sale.observations }}</p>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card class="pa-4 mb-4">
            <h2 class="text-h6 mb-3">Documentación</h2>
            <v-alert
              v-if="documentsQuery.data.value?.storageIntegrationPending !== false"
              type="info"
              variant="tonal"
              density="compact"
              class="mb-3"
              text="Pendiente de integración con almacenamiento."
            />
            <v-list density="compact">
              <v-list-item
                v-for="category in documentsQuery.data.value?.requiredCategories ?? []"
                :key="`${category.documentType}-${category.saleMemberId ?? 'sale'}`"
              >
                <v-list-item-title>{{ category.label }}</v-list-item-title>
                <template #append>
                  <v-chip size="x-small" variant="tonal">
                    {{ category.satisfied ? 'OK' : 'Pendiente' }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card>

          <v-card class="pa-4">
            <h2 class="text-h6 mb-3">Historial</h2>
            <v-list
              v-if="historyQuery.data.value?.items.length"
              class="bg-transparent pa-0"
              density="compact"
            >
              <v-list-item
                v-for="entry in historyQuery.data.value.items"
                :key="entry.id"
                class="px-0"
              >
                <v-list-item-title class="text-wrap">
                  <div class="text-caption text-medium-emphasis mb-1">
                    {{ formatDateTime(entry.createdAt) }}
                  </div>
                  <div class="d-flex flex-wrap align-center ga-1">
                    <StatusBadge v-if="entry.fromStatus" :status="entry.fromStatus" />
                    <span v-else class="text-caption">Inicio</span>
                    <span aria-hidden="true">→</span>
                    <StatusBadge :status="entry.toStatus" />
                  </div>
                </v-list-item-title>
                <v-list-item-subtitle v-if="entry.reason" class="text-wrap mt-1">
                  {{ entry.reason }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
            <p v-else class="text-medium-emphasis mb-0">Sin cambios de estado.</p>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <ConfirmDialog
      v-model="submitConfirm"
      title="¿Presentar esta venta?"
      message="Se ejecutará la validación final en el servidor."
      confirm-text="Presentar"
      @confirm="onSubmit"
    />

    <ConfirmDialog
      v-model="returnConfirm"
      title="¿Devolver esta venta?"
      message="El vendedor podrá corregir el borrador y presentarla nuevamente."
      confirm-text="Devolver"
      color="warning"
      :loading="returnMutation.isPending.value"
      @confirm="onReturn"
    >
      <v-textarea
        v-model="returnReason"
        class="mt-4"
        label="Motivo de la devolución"
        rows="3"
        maxlength="2000"
        counter
        autofocus
      />
    </ConfirmDialog>
  </div>
</template>
