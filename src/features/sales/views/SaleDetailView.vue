<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import SaleDeleteButton from '../components/SaleDeleteButton.vue';
import SaleDetailData from '../components/SaleDetailData.vue';
import SaleDetailFields from '../components/SaleDetailFields.vue';
import SaleDetailDocuments from '../components/SaleDetailDocuments.vue';
import SaleResolutionNotice from '../components/SaleResolutionNotice.vue';
import SaleAssigneeNotice from '../components/SaleAssigneeNotice.vue';
import { apiErrorMessage, isApiError } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import { formatDateTime, formatSaleNumber } from '@/utils/format';
import { getSaleReadiness } from '../utils/sale-readiness';
import { saleToFormModel } from '../utils/sale-form-model';
import {
  useDownloadSaleDocumentMutation,
  useDownloadSaleDocumentsMutation,
  useExportSaleMutation,
  useReturnSaleMutation,
  useSaleDocumentsQuery,
  useSaleHistoryQuery,
  useSaleQuery,
  useSubmitSaleMutation,
} from '../composables/useSales';
import SaleObservationsPanel from '@/features/administrative/components/SaleObservationsPanel.vue';
import {
  canEditSaleStatus,
  canReturnForCorrection,
  customerTypeLabel,
  saleHistoryReasonLabel,
} from '../utils/sale-labels';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const saleId = computed(() => String(route.params.id));

const saleQuery = useSaleQuery(saleId);
const historyQuery = useSaleHistoryQuery(saleId);
const documentsQuery = useSaleDocumentsQuery(saleId);
const submitMutation = useSubmitSaleMutation();
const returnMutation = useReturnSaleMutation();
const exportMutation = useExportSaleMutation();
const downloadMutation = useDownloadSaleDocumentMutation(saleId);
const archiveMutation = useDownloadSaleDocumentsMutation(saleId);

const canUpdate = computed(() => auth.hasPermission('sales.update'));
/** Present uses the same backend permission as update (`sales.update`). */
const canSubmit = canUpdate;
/** Export is gated by `sales.read` on the API. */
const canExport = computed(() => auth.hasPermission('sales.read'));
const canReturn = computed(() => auth.hasPermission('sales.return'));
const canReviewAdmin = computed(() => auth.hasPermission('sales.review'));
const sale = computed(() => saleQuery.data.value);
const editable = computed(() => canEditSaleStatus(sale.value?.status));
const readiness = computed(() =>
  getSaleReadiness(
    sale.value ? saleToFormModel(sale.value) : null,
    documentsQuery.error.value ? undefined : documentsQuery.data.value,
  ),
);
const readyToPresent = computed(
  () =>
    canSubmit.value &&
    editable.value &&
    readiness.value.ready &&
    !documentsQuery.isFetching.value &&
    !documentsQuery.error.value &&
    !saleQuery.isFetching.value,
);
const canReturnSale = computed(() => canReturn.value && canReturnForCorrection(sale.value?.status));
const showCorrections = computed(
  () =>
    sale.value?.status === 'RETURNED' ||
    sale.value?.status === 'SUBMITTED' ||
    sale.value?.status === 'IN_REVIEW',
);

const submitConfirm = ref(false);
const returnConfirm = ref(false);
const returnReason = ref('');
const actionError = ref<string | null>(null);

const holderName = computed(() => {
  const holder = sale.value?.members.find((member) => member.memberType === 'HOLDER');
  return [holder?.firstName, holder?.lastName].filter(Boolean).join(' ') || 'Titular sin completar';
});
const history = computed(() =>
  [...(historyQuery.data.value?.items ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  ),
);

async function onSubmit(): Promise<void> {
  submitConfirm.value = false;
  if (!readyToPresent.value) return;
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
      :title="sale ? `Venta ${formatSaleNumber(sale.saleNumber)}` : 'Detalle de venta'"
      :subtitle="sale ? holderName : 'Cargando…'"
    >
      <template #actions>
        <div class="d-flex align-center flex-wrap ga-2">
          <StatusBadge v-if="sale" :status="sale.status" />
          <v-btn variant="text" prepend-icon="mdi-arrow-left" :to="{ name: 'sales' }">Volver</v-btn>
          <v-btn
            v-if="canReviewAdmin"
            variant="tonal"
            :to="{ name: 'admin-sale-review', params: { id: saleId } }"
          >
            Vista administrativa
          </v-btn>
          <v-btn
            v-if="canUpdate && editable"
            color="primary"
            :variant="readyToPresent ? 'tonal' : 'flat'"
            prepend-icon="mdi-pencil-outline"
            :to="{ name: 'sale-edit', params: { id: saleId } }"
          >
            Editar
          </v-btn>
          <v-btn
            v-if="canSubmit && editable"
            color="primary"
            :variant="readyToPresent ? 'flat' : 'outlined'"
            :loading="submitMutation.isPending.value"
            :disabled="!readyToPresent"
            :title="
              readyToPresent
                ? undefined
                : 'Completá los datos obligatorios y la documentación desde Editar.'
            "
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
            v-if="canExport && sale && sale.status !== 'DRAFT'"
            variant="tonal"
            prepend-icon="mdi-download"
            :loading="exportMutation.isPending.value"
            @click="exportMutation.mutate(saleId)"
          >
            Exportar Excel
          </v-btn>
          <SaleDeleteButton v-if="sale" :sale="sale" @deleted="router.replace({ name: 'sales' })" />
        </div>
      </template>
    </PageHeader>

    <SaleAssigneeNotice v-if="sale" :assignee="sale.administrativeAssignee" />

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
      <SaleResolutionNotice
        :status="sale.status"
        :history="historyQuery.data.value"
        :loading="historyQuery.isFetching.value"
        :error="!!historyQuery.error.value"
        @retry="historyQuery.refetch()"
      />
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
        v-if="sale.status === 'RETURNED'"
        type="warning"
        variant="tonal"
        class="mb-4"
        title="Venta devuelta"
        text="Revisá las solicitudes de corrección, editá los datos y presentá nuevamente."
      >
        <template v-if="canUpdate" #append>
          <v-btn color="warning" variant="flat" :to="{ name: 'sale-edit', params: { id: saleId } }">
            Corregir
          </v-btn>
        </template>
      </v-alert>

      <v-card class="pa-4 pa-md-6 mb-4" data-testid="sale-detail-summary">
        <div class="d-flex flex-wrap justify-space-between align-center ga-3 mb-5">
          <h2 class="text-h6">Cobertura de la venta</h2>
          <v-chip variant="tonal" prepend-icon="mdi-account-group-outline"
            >{{ sale.members.length }}
            {{ sale.members.length === 1 ? 'integrante' : 'integrantes' }}</v-chip
          >
        </div>
        <SaleDetailFields
          wide
          :fields="[
            { label: 'Prepaga', value: sale.healthInsurer?.name },
            { label: 'Plan', value: sale.healthPlan?.name },
            {
              label: 'Tipo de venta',
              value: sale.customerType ? customerTypeLabel(sale.customerType) : null,
            },
            { label: 'Titular', value: holderName },
          ]"
        />
      </v-card>

      <v-alert
        v-if="canUpdate && editable && !readyToPresent"
        type="info"
        class="mb-4"
        title="Esta venta todavía está en preparación"
        :text="
          documentsQuery.error.value
            ? 'No pudimos verificar la documentación. Reintentá la carga antes de presentar.'
            : documentsQuery.isFetching.value || saleQuery.isFetching.value
              ? 'Verificando los datos y la documentación de la venta…'
              : `Completá o corregí los ${readiness.pending.length} requisitos pendientes desde Editar para presentar la venta.`
        "
      />

      <v-row>
        <v-col cols="12" md="8" class="sale-detail-column">
          <SaleDetailData :sale="sale" />

          <v-card v-if="showCorrections" class="pa-4 pa-md-6 mt-4" data-testid="sale-corrections">
            <h2 class="text-h6 mb-4">Seguimiento de la venta</h2>
            <SaleObservationsPanel :sale-id="saleId" />
          </v-card>
        </v-col>

        <v-col cols="12" md="4" class="sale-detail-column">
          <SaleDetailDocuments
            class="mb-4"
            :documents="documentsQuery.data.value"
            :loading="documentsQuery.isFetching.value"
            :error="
              documentsQuery.error.value ? apiErrorMessage(documentsQuery.error.value) : undefined
            "
            :download-error="
              archiveMutation.error.value
                ? apiErrorMessage(archiveMutation.error.value)
                : downloadMutation.error.value
                  ? apiErrorMessage(downloadMutation.error.value)
                  : undefined
            "
            :downloading-id="
              downloadMutation.isPending.value
                ? downloadMutation.variables.value?.documentId
                : undefined
            "
            :downloading-all="archiveMutation.isPending.value"
            @retry="documentsQuery.refetch()"
            @download="
              archiveMutation.reset();
              downloadMutation.mutate($event);
            "
            @download-all="
              downloadMutation.reset();
              archiveMutation.mutate();
            "
          />

          <v-card class="pa-4">
            <h2 class="text-h6 mb-1">
              <v-icon icon="mdi-history" size="22" class="mr-2 text-primary" />Historial
            </h2>
            <p class="text-body-2 text-medium-emphasis mb-4">
              Los movimientos más recientes primero.
            </p>
            <ErrorState
              v-if="historyQuery.error.value"
              :message="apiErrorMessage(historyQuery.error.value)"
              @retry="historyQuery.refetch()"
            />
            <v-progress-linear
              v-else-if="historyQuery.isLoading.value"
              indeterminate
              color="primary"
              aria-label="Cargando historial"
            />
            <v-list v-else-if="history.length" class="bg-transparent pa-0" density="compact">
              <v-list-item v-for="entry in history" :key="entry.id" class="px-0">
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
                <p
                  v-if="saleHistoryReasonLabel(entry.reason)"
                  class="text-body-2 text-medium-emphasis text-break mt-1 mb-0"
                >
                  {{ saleHistoryReasonLabel(entry.reason) }}
                </p>
              </v-list-item>
            </v-list>
            <EmptyState
              v-else
              compact
              title="Sin cambios de estado"
              text="Los próximos movimientos se mostrarán acá."
              icon="mdi-history"
            />
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

<style scoped>
.sale-detail-column {
  min-width: 0;
}
</style>
