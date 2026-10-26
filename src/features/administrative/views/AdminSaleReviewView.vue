<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import {
  useDownloadSaleDocumentMutation,
  useExportSaleMutation,
  useReturnSaleMutation,
  useSaleDocumentsQuery,
  useSaleHistoryQuery,
  useSaleQuery,
} from '@/features/sales/composables/useSales';
import {
  canRegisterAdminActions,
  canReturnForCorrection,
  canStartReview,
  customerTypeLabel,
  saleHistoryReasonLabel,
} from '@/features/sales/utils/sale-labels';
import { apiErrorMessage, isApiError } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import { formatDateTime, formatSaleNumber } from '@/utils/format';
import AdminReviewSectionNav, {
  type AdminReviewSectionId,
} from '../components/AdminReviewSectionNav.vue';
import SaleFollowUpsPanel from '../components/SaleFollowUpsPanel.vue';
import SaleObservationsPanel from '../components/SaleObservationsPanel.vue';
import SaleResolutionActions from '../components/SaleResolutionActions.vue';
import SaleResolutionNotice from '@/features/sales/components/SaleResolutionNotice.vue';
import SaleDetailFields from '@/features/sales/components/SaleDetailFields.vue';
import SaleAssigneeNotice from '@/features/sales/components/SaleAssigneeNotice.vue';
import AdminSaleData from '../components/AdminSaleData.vue';
import SaleDetailDocuments from '@/features/sales/components/SaleDetailDocuments.vue';
import {
  useSetSaleAssigneeMutation,
  useStartSaleReviewMutation,
} from '../composables/useAdministrative';

const route = useRoute();
const auth = useAuthStore();
const saleId = computed(() => String(route.params.id));
const initialSection = route.query.section;
const section = ref<AdminReviewSectionId>(
  typeof initialSection === 'string' &&
    [
      'summary',
      'details',
      'members',
      'contact',
      'employment',
      'billing',
      'documents',
      'observations',
      'followUps',
      'history',
    ].includes(initialSection)
    ? (initialSection as AdminReviewSectionId)
    : 'summary',
);

const saleQuery = useSaleQuery(saleId);
const historyQuery = useSaleHistoryQuery(saleId);
const documentsQuery = useSaleDocumentsQuery(saleId);
const startReviewMutation = useStartSaleReviewMutation();
const returnMutation = useReturnSaleMutation();
const assigneeMutation = useSetSaleAssigneeMutation();
const exportMutation = useExportSaleMutation();
const downloadMutation = useDownloadSaleDocumentMutation(saleId);

const sale = computed(() => saleQuery.data.value);
const canReview = computed(() => auth.hasPermission('sales.review'));
const canReturn = computed(() => auth.hasPermission('sales.return'));
const canObserve = computed(() => auth.hasPermission('sales.observe'));
const canFollowUp = computed(() => auth.hasPermission('sales.follow_up'));
const canExport = computed(() => auth.hasPermission('sales.read'));

const showStartReview = computed(() => canReview.value && canStartReview(sale.value?.status));
const showReturn = computed(() => canReturn.value && canReturnForCorrection(sale.value?.status));
const showAdminActions = computed(() => canRegisterAdminActions(sale.value?.status));

const returnDialog = ref(false);
const returnReason = ref('');
const actionError = ref<string | null>(null);

const employmentLabel = computed(() => {
  const employment = !!sale.value?.employment || sale.value?.customerType === 'DEREGULATED';
  const tax = !!sale.value?.taxInfo || sale.value?.customerType === 'MONOTAX';
  return employment && tax
    ? 'Laboral / impositivo'
    : employment
      ? 'Laboral'
      : tax
        ? 'Impositivo'
        : null;
});
const sections = computed(() => {
  const base: { id: AdminReviewSectionId; label: string }[] = [
    { id: 'summary', label: 'Resumen' },
    { id: 'details', label: 'Datos de venta' },
    { id: 'members', label: 'Integrantes' },
    { id: 'contact', label: 'Contacto' },
  ];
  if (employmentLabel.value) base.push({ id: 'employment', label: employmentLabel.value });
  base.push(
    { id: 'billing', label: 'Cobranza' },
    { id: 'documents', label: 'Documentación' },
    { id: 'observations', label: 'Observaciones' },
    { id: 'followUps', label: 'Seguimientos' },
    { id: 'history', label: 'Historial' },
  );
  return base;
});

watch([employmentLabel, () => sale.value?.id], ([label, id]) => {
  if (id && !label && section.value === 'employment') section.value = 'summary';
});

const assigneeLabel = computed(() => {
  const assignee = sale.value?.administrativeAssignee;
  if (!assignee) return 'Sin responsable';
  return `${assignee.lastName}, ${assignee.firstName}`;
});

async function onStartReview(): Promise<void> {
  actionError.value = null;
  try {
    await startReviewMutation.mutateAsync(saleId.value);
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
  actionError.value = null;
  try {
    await returnMutation.mutateAsync({ id: saleId.value, body: { reason } });
    returnDialog.value = false;
    returnReason.value = '';
    section.value = 'observations';
  } catch (error: unknown) {
    actionError.value = apiErrorMessage(error);
  }
}

async function assignToMe(): Promise<void> {
  if (!auth.user?.id || sale.value?.administrativeAssignee) return;
  actionError.value = null;
  try {
    await assigneeMutation.mutateAsync({
      id: saleId.value,
      body: { administrativeAssigneeId: auth.user.id },
    });
  } catch (error: unknown) {
    actionError.value = apiErrorMessage(error);
  }
}
</script>

<template>
  <div data-testid="admin-sale-review">
    <PageHeader
      :title="sale ? `Venta ${formatSaleNumber(sale.saleNumber)}` : 'Revisión de venta'"
      :subtitle="sale ? `Prepaga: ${sale.healthInsurer?.name ?? '—'}` : 'Cargando…'"
    >
      <template #actions>
        <div class="d-flex flex-wrap ga-2">
          <StatusBadge v-if="sale" :status="sale.status" />
          <SaleResolutionActions v-if="sale" :sale="sale" />
          <v-btn variant="text" :to="{ name: 'admin-sales' }">Volver</v-btn>
          <v-btn
            v-if="showStartReview"
            color="primary"
            :loading="startReviewMutation.isPending.value"
            @click="onStartReview"
          >
            Iniciar revisión
          </v-btn>
          <v-btn
            v-if="showReturn"
            color="warning"
            variant="tonal"
            @click="
              returnDialog = true;
              actionError = null;
            "
          >
            Solicitar corrección
          </v-btn>
          <v-btn
            v-if="
              canReview &&
              showAdminActions &&
              sale?.status === 'IN_REVIEW' &&
              !sale.administrativeAssignee
            "
            variant="tonal"
            :loading="assigneeMutation.isPending.value"
            @click="assignToMe"
          >
            Tomar responsabilidad
          </v-btn>
          <v-btn
            v-if="canExport && sale && sale.status !== 'DRAFT'"
            variant="tonal"
            :loading="exportMutation.isPending.value"
            @click="exportMutation.mutate(saleId)"
          >
            Exportar Excel
          </v-btn>
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
        closable
        @click:close="actionError = null"
      >
        {{ actionError }}
      </v-alert>

      <v-alert
        v-if="sale.status === 'RETURNED'"
        type="warning"
        variant="tonal"
        class="mb-4"
        title="Venta devuelta"
        text="Esperá la nueva presentación del vendedor. Podés consultar observaciones y seguimientos."
      />

      <v-row>
        <v-col cols="12" md="3" class="d-none d-md-block">
          <v-card class="pa-2">
            <AdminReviewSectionNav v-model="section" :sections="sections" />
          </v-card>
        </v-col>
        <v-col cols="12" md="9">
          <v-select
            v-model="section"
            class="d-md-none mb-4"
            :items="sections.map((row) => ({ title: row.label, value: row.id }))"
            label="Sección"
          />

          <v-card v-if="section === 'summary'" class="pa-4 pa-md-6">
            <h2 class="text-h6 mb-4">Resumen</h2>
            <v-row dense>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Estado</div>
                <StatusBadge :status="sale.status" />
              </v-col>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Responsable</div>
                <div>{{ assigneeLabel }}</div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Vendedor</div>
                <div>{{ sale.seller.lastName }}, {{ sale.seller.firstName }}</div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Tipo</div>
                <div>{{ customerTypeLabel(sale.customerType) }}</div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Presentada</div>
                <div>{{ sale.submittedAt ? formatDateTime(sale.submittedAt) : '—' }}</div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Inicio de revisión</div>
                <div>
                  {{ sale.reviewStartedAt ? formatDateTime(sale.reviewStartedAt) : '—' }}
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Última revisión</div>
                <div>
                  {{ sale.lastReviewedAt ? formatDateTime(sale.lastReviewedAt) : '—' }}
                </div>
              </v-col>
              <v-col cols="12" sm="6">
                <div class="text-caption text-medium-emphasis">Último movimiento</div>
                <div>{{ formatDateTime(sale.updatedAt) }}</div>
              </v-col>
            </v-row>
          </v-card>

          <AdminSaleData
            v-else-if="
              section === 'details' ||
              section === 'members' ||
              section === 'employment' ||
              section === 'billing'
            "
            :sale="sale"
            :section="section"
          />

          <v-card
            v-else-if="section === 'contact'"
            class="pa-4 pa-md-6"
            data-testid="admin-sale-contact"
          >
            <h2 class="text-h6 mb-4">Contacto</h2>
            <SaleDetailFields
              :fields="[
                {
                  label: 'Teléfono',
                  value: [sale.contact?.areaCode, sale.contact?.phone].filter(Boolean).join(' '),
                },
                { label: 'Correo electrónico', value: sale.contact?.email },
                { label: 'Domicilio', value: sale.contact?.address },
                { label: 'Código postal', value: sale.contact?.postalCode },
                { label: 'Provincia', value: sale.contact?.province },
              ]"
            />
          </v-card>

          <SaleDetailDocuments
            v-else-if="section === 'documents'"
            :documents="documentsQuery.data.value"
            :members="sale.members"
            :loading="documentsQuery.isFetching.value"
            :error="
              documentsQuery.error.value ? apiErrorMessage(documentsQuery.error.value) : undefined
            "
            :download-error="
              downloadMutation.error.value
                ? apiErrorMessage(downloadMutation.error.value)
                : undefined
            "
            :downloading-id="
              downloadMutation.isPending.value
                ? downloadMutation.variables.value?.documentId
                : undefined
            "
            @retry="documentsQuery.refetch()"
            @download="downloadMutation.mutate($event)"
          />

          <v-card v-else-if="section === 'observations'" class="pa-4 pa-md-6">
            <h2 class="text-h6 mb-4">Observaciones</h2>
            <SaleObservationsPanel
              :sale-id="saleId"
              :can-observe="canObserve && showAdminActions"
              :can-resolve="canObserve && showAdminActions"
            />
          </v-card>

          <v-card v-else-if="section === 'followUps'" class="pa-4 pa-md-6">
            <h2 class="text-h6 mb-4">Seguimientos</h2>
            <SaleFollowUpsPanel :sale-id="saleId" :can-create="canFollowUp && showAdminActions" />
          </v-card>

          <v-card v-else-if="section === 'history'" class="pa-4 pa-md-6">
            <h2 class="text-h6 mb-4">Historial</h2>
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
                <p
                  v-if="saleHistoryReasonLabel(entry.reason)"
                  class="text-body-2 text-medium-emphasis text-break mt-1 mb-0"
                >
                  {{ saleHistoryReasonLabel(entry.reason) }}
                </p>
              </v-list-item>
            </v-list>
            <p v-else class="text-medium-emphasis mb-0">Sin cambios de estado.</p>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <ConfirmDialog
      v-model="returnDialog"
      title="Solicitar corrección"
      message="Se devolverá la venta al vendedor con una observación de corrección."
      confirm-text="Devolver"
      color="warning"
      :loading="returnMutation.isPending.value"
      :error-message="actionError"
      @confirm="onReturn"
    >
      <v-textarea
        v-model="returnReason"
        class="mt-4"
        label="Motivo (obligatorio)"
        rows="4"
        maxlength="2000"
        counter
        autofocus
      />
    </ConfirmDialog>
  </div>
</template>
