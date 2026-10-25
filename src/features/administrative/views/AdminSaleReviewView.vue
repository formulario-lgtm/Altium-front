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
  documentTypeLabel,
  memberTypeLabel,
  saleHistoryReasonLabel,
  PAYMENT_METHOD_OPTIONS,
} from '@/features/sales/utils/sale-labels';
import { apiErrorMessage, isApiError } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import { formatDateTime, formatSaleNumber } from '@/utils/format';
import AdminReviewSectionNav, {
  type AdminReviewSectionId,
} from '../components/AdminReviewSectionNav.vue';
import SaleFollowUpsPanel from '../components/SaleFollowUpsPanel.vue';
import SaleObservationsPanel from '../components/SaleObservationsPanel.vue';
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

const sections = computed(() => {
  const base: { id: AdminReviewSectionId; label: string }[] = [
    { id: 'summary', label: 'Resumen' },
    { id: 'details', label: 'Datos de venta' },
    { id: 'members', label: 'Integrantes' },
    { id: 'contact', label: 'Contacto' },
  ];
  if (sale.value?.employment || sale.value?.taxInfo) {
    base.push({
      id: 'employment',
      label:
        sale.value?.employment && sale.value?.taxInfo
          ? 'Laboral / impositivo'
          : sale.value?.employment
            ? 'Laboral'
            : 'Impositivo',
    });
  }
  base.push(
    { id: 'billing', label: 'Cobranza' },
    { id: 'documents', label: 'Documentación' },
    { id: 'observations', label: 'Observaciones' },
    { id: 'followUps', label: 'Seguimientos' },
    { id: 'history', label: 'Historial' },
  );
  return base;
});

watch(
  () => sale.value?.customerType,
  () => {
    if (section.value === 'employment' && !sale.value?.employment && !sale.value?.taxInfo) {
      section.value = 'summary';
    }
  },
);

const paymentMethodLabel = computed(() => {
  const method = sale.value?.billing?.paymentMethod;
  return PAYMENT_METHOD_OPTIONS.find((option) => option.value === method)?.title ?? '—';
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
  if (!auth.user?.id) return;
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
            v-if="canReview && showAdminActions && sale?.status === 'IN_REVIEW'"
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

          <v-card v-else-if="section === 'details'" class="pa-4 pa-md-6">
            <h2 class="text-h6 mb-4">Datos de venta</h2>
            <v-row dense>
              <v-col cols="12" sm="6">Prepaga: {{ sale.healthInsurer.name }}</v-col>
              <v-col cols="12" sm="6">Plan: {{ sale.healthPlan?.name ?? '—' }}</v-col>
              <v-col cols="12" sm="6">Tipo: {{ customerTypeLabel(sale.customerType) }}</v-col>
              <v-col cols="12">{{ sale.observations || 'Sin observaciones del vendedor.' }}</v-col>
            </v-row>
          </v-card>

          <v-card v-else-if="section === 'members'" class="pa-4 pa-md-6">
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
            <p class="text-caption text-medium-emphasis mt-3 mb-0">
              Los detalles clínicos sensibles no se destacan en esta vista de revisión.
            </p>
          </v-card>

          <v-card v-else-if="section === 'contact'" class="pa-4 pa-md-6">
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

          <v-card v-else-if="section === 'employment'" class="pa-4 pa-md-6">
            <template v-if="sale.employment">
              <h2 class="text-h6 mb-4">Situación laboral</h2>
              <div v-for="employer in sale.employment.employers" :key="employer.id" class="mb-1">
                CUIT: {{ employer.employerCuit }}
              </div>
              <div>Obra social: {{ sale.employment.currentInsurance ?? '—' }}</div>
              <div>Sueldo bruto: {{ sale.employment.grossSalary ?? '—' }}</div>
            </template>
            <template v-if="sale.taxInfo">
              <h2 class="text-h6 mb-4 mt-4">Situación impositiva</h2>
              <div>Categoría: {{ sale.taxInfo.monotaxCategory ?? '—' }}</div>
              <div>Obra social: {{ sale.taxInfo.currentInsurance ?? '—' }}</div>
            </template>
          </v-card>

          <v-card v-else-if="section === 'billing'" class="pa-4 pa-md-6">
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
            <div
              v-if="sale.billing?.paymentMethod === 'CBU' && sale.billing?.paymentMedium"
            >
              CBU/CVU/ALIAS: {{ sale.billing.paymentMedium }}
            </div>
          </v-card>

          <v-card v-else-if="section === 'documents'" class="pa-4 pa-md-6">
            <h2 class="text-h6 mb-4">Documentación</h2>
            <v-list density="compact">
              <v-list-item
                v-for="category in documentsQuery.data.value?.requiredCategories ?? []"
                :key="`${category.documentType}-${category.saleMemberId ?? 'sale'}`"
              >
                <v-list-item-title class="text-wrap">{{ category.label }}</v-list-item-title>
                <template #append>
                  <v-chip
                    size="x-small"
                    variant="tonal"
                    :color="category.satisfied ? 'success' : 'warning'"
                  >
                    {{ category.satisfied ? 'Completo' : 'Pendiente' }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
            <v-list v-if="documentsQuery.data.value?.items?.length" density="compact" class="mt-2">
              <v-list-item v-for="doc in documentsQuery.data.value.items" :key="doc.id">
                <v-list-item-title class="text-wrap">
                  {{ doc.originalFilename || 'Archivo' }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ documentTypeLabel(doc.documentType) }}
                </v-list-item-subtitle>
                <template #append>
                  <v-btn
                    icon="mdi-download"
                    variant="text"
                    size="small"
                    aria-label="Descargar"
                    @click="
                      downloadMutation.mutate({
                        documentId: doc.id,
                        filename: doc.originalFilename,
                      })
                    "
                  />
                </template>
              </v-list-item>
            </v-list>
          </v-card>

          <v-card v-else-if="section === 'observations'" class="pa-4 pa-md-6">
            <h2 class="text-h6 mb-4">Observaciones</h2>
            <SaleObservationsPanel
              :sale-id="saleId"
              :can-observe="canObserve && showAdminActions"
              :can-resolve="canObserve"
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
                <v-list-item-subtitle
                  v-if="saleHistoryReasonLabel(entry.reason)"
                  class="text-wrap mt-1"
                >
                  {{ saleHistoryReasonLabel(entry.reason) }}
                </v-list-item-subtitle>
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
