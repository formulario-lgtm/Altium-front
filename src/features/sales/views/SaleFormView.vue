<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import {
  apiErrorMessage,
  fieldErrorsToMap,
  isApiError,
  type SaleMemberInput,
} from '@/services/http';
import SaleContactFields from '../components/SaleContactFields.vue';
import SaleEmploymentFields from '../components/SaleEmploymentFields.vue';
import SaleTaxFields from '../components/SaleTaxFields.vue';
import SaleBillingFields from '../components/SaleBillingFields.vue';
import FamilyMemberCard from '../components/FamilyMemberCard.vue';
import SaleFormProgress from '../components/SaleFormProgress.vue';
import { getSaleReadiness } from '../utils/sale-readiness';
import SaleDocuments from '../components/SaleDocuments.vue';
import SaleSaveStatus from '../components/SaleSaveStatus.vue';
import SaleSectionNav, { type SaleSectionId } from '../components/SaleSectionNav.vue';
import { useSaleLeaveGuard } from '../composables/useSaleLeaveGuard';
import { useSaleForm } from '../composables/useSaleForm';
import {
  useHealthInsurersQuery,
  useHealthPlansQuery,
  useSaleDocumentsQuery,
  useSubmitSaleMutation,
} from '../composables/useSales';
import { createSaleFormRowKey } from '../utils/sale-form-row-key';
import { emptyMember } from '../utils/sale-form-model';
import { fieldErrorProps, saleFieldPathLabel } from '../utils/sale-field-errors';
import { formatSaleNumber } from '@/utils/format';
import { CUSTOMER_TYPE_OPTIONS, healthPlanOptionLabel } from '../utils/sale-labels';

const route = useRoute();
const router = useRouter();
const saleId = computed(() => String(route.params.id));

const form = useSaleForm(saleId);
const leaveGuard = useSaleLeaveGuard(form);
const insurersQuery = useHealthInsurersQuery();
const plansQuery = useHealthPlansQuery(computed(() => form.model.value?.healthInsurerId ?? null));
const documentsQuery = useSaleDocumentsQuery(saleId);
const submitMutation = useSubmitSaleMutation();

const section = ref<SaleSectionId>('details');
const formElement = ref<HTMLElement>();
const changingSection = ref(false);
const memberKey = createSaleFormRowKey();
const submitConfirm = ref(false);
const submitError = ref<string | null>(null);
const submitFieldErrors = ref<Record<string, string>>({});

/** Save + submit Problem Details paths (`members[0].cuil`, `contact.email`, …). */
const allFieldErrors = computed(() => ({
  ...form.fieldErrors.value,
  ...submitFieldErrors.value,
}));
const readiness = computed(() =>
  getSaleReadiness(
    form.model.value,
    documentsQuery.error.value ? undefined : documentsQuery.data.value,
  ),
);
const canPresent = computed(
  () =>
    form.editable.value &&
    readiness.value.ready &&
    form.saveStatus.value === 'saved' &&
    !documentsQuery.isFetching.value &&
    !documentsQuery.error.value &&
    !submitMutation.isPending.value,
);
const presentationHint = computed(() =>
  readiness.value.pending.length
    ? `Completá o corregí ${readiness.value.pending.length} requisitos antes de presentar.`
    : form.saveStatus.value === 'error'
      ? 'Guardá el borrador sin errores antes de presentar.'
      : form.hasUnsavedChanges.value && form.saveStatus.value !== 'saving'
        ? 'Guardá el borrador o cambiá de sección para guardar tus cambios antes de presentar.'
        : !canPresent.value
          ? 'Esperá a que finalicen el guardado y la verificación de documentos.'
          : 'La venta está lista para presentar.',
);

function fieldProps(path: string) {
  return fieldErrorProps(allFieldErrors.value, path);
}

function clearFieldError(path: string): void {
  if (path in submitFieldErrors.value) {
    const next = { ...submitFieldErrors.value };
    delete next[path];
    submitFieldErrors.value = next;
  }
  if (path in form.fieldErrors.value) {
    const next = { ...form.fieldErrors.value };
    delete next[path];
    form.fieldErrors.value = next;
  }
  if (Object.keys(submitFieldErrors.value).length === 0 && submitError.value) {
    submitError.value = null;
  }
}

const sections = computed(() => {
  const customerType = form.model.value?.customerType;
  const base: { id: SaleSectionId; label: string }[] = [
    { id: 'details', label: 'Datos de la venta' },
    { id: 'members', label: 'Integrantes' },
    { id: 'contact', label: 'Contacto y domicilio' },
  ];
  if (customerType === 'DEREGULATED') {
    base.push({ id: 'employment', label: 'Situación laboral' });
  }
  if (customerType === 'MONOTAX') {
    base.push({ id: 'tax', label: 'Situación impositiva' });
  }
  base.push(
    { id: 'billing', label: 'Cobranza y facturación' },
    { id: 'documents', label: 'Documentación' },
    { id: 'notes', label: 'Observaciones' },
  );
  return base;
});

async function revealErrors(): Promise<void> {
  const firstField = Object.keys(allFieldErrors.value)[0];
  if (!firstField) return;
  section.value = sectionForField(firstField);
  await nextTick();
  const input = formElement.value?.querySelector<HTMLElement>(
    '.v-input--error input, .v-input--error textarea',
  );
  input?.focus();
  (input ?? formElement.value?.querySelector('[role="alert"]'))?.scrollIntoView({
    block: 'center',
    behavior: 'smooth',
  });
}

async function saveDraft(): Promise<boolean> {
  submitError.value = null;
  submitFieldErrors.value = {};
  const saved = await form.persist();
  if (!saved) await revealErrors();
  return Boolean(saved) && !form.hasUnsavedChanges.value;
}

async function requestSection(next: SaleSectionId): Promise<void> {
  if (next === section.value || changingSection.value) return;
  changingSection.value = true;
  try {
    if (form.editable.value && !(await saveDraft())) return;
    section.value = next;
  } finally {
    changingSection.value = false;
  }
}

watch(
  () => form.model.value?.customerType,
  () => {
    const ids = sections.value.map((item) => item.id);
    if (!ids.includes(section.value)) {
      section.value = 'details';
    }
  },
);

watch(
  () => form.model.value?.healthInsurerId,
  (next, prev) => {
    if (prev && next !== prev && form.model.value) {
      form.model.value.healthPlanId = null;
    }
  },
);

const insurerItems = computed(() =>
  (insurersQuery.data.value?.items ?? []).map((row) => ({ title: row.name, value: row.id })),
);
const planItems = computed(() =>
  (plansQuery.data.value?.items ?? []).map((row) => ({
    title: healthPlanOptionLabel(row),
    value: row.id,
  })),
);

const spouse = computed(() => form.model.value?.members.find((m) => m.memberType === 'SPOUSE'));
const children = computed(() =>
  (form.model.value?.members ?? [])
    .map((member, index) => ({ member, index }))
    .filter((row) => row.member.memberType === 'CHILD'),
);
const holderIndex = computed(() =>
  (form.model.value?.members ?? []).findIndex((m) => m.memberType === 'HOLDER'),
);
const spouseRows = computed(() =>
  (form.model.value?.members ?? [])
    .map((member, index) => ({ member, index }))
    .filter((row) => row.member.memberType === 'SPOUSE'),
);

function goSection(delta: number): void {
  const ids = sections.value.map((s) => s.id);
  const current = ids.indexOf(section.value);
  const next = ids[current + delta];
  if (next) void requestSection(next);
}

function addSpouse(): void {
  if (!form.model.value || spouse.value) return;
  form.model.value.members.push(emptyMember('SPOUSE'));
}

function addChild(): void {
  if (!form.model.value) return;
  form.model.value.members.push(emptyMember('CHILD'));
}

function removeMemberAt(index: number): void {
  if (!form.model.value) return;
  const member = form.model.value.members[index];
  if (!member || member.memberType === 'HOLDER') return;
  form.model.value.members.splice(index, 1);
}

function updateMemberAt(index: number, member: SaleMemberInput): void {
  if (!form.model.value) return;
  const current = form.model.value.members[index];
  if (current) Object.assign(current, member);
}

function sectionForField(field: string): SaleSectionId {
  if (field.startsWith('members')) return 'members';
  if (field.startsWith('contact')) return 'contact';
  if (field.startsWith('employment')) return 'employment';
  if (field.startsWith('taxInfo')) return 'tax';
  if (field.startsWith('billing')) return 'billing';
  if (field.startsWith('documents')) return 'documents';
  if (field === 'observations') return 'notes';
  return 'details';
}

async function onSubmitConfirm(): Promise<void> {
  submitConfirm.value = false;
  if (!canPresent.value) return;
  submitError.value = null;
  submitFieldErrors.value = {};
  const saved = await form.persist({ force: true });
  if (
    !saved ||
    form.versionConflict.value ||
    !readiness.value.ready ||
    form.saveStatus.value !== 'saved' ||
    documentsQuery.error.value
  ) {
    await revealErrors();
    return;
  }
  try {
    const sale = await submitMutation.mutateAsync(saleId.value);
    await router.push({ name: 'sale-detail', params: { id: sale.id } });
  } catch (error: unknown) {
    submitError.value = apiErrorMessage(error);
    if (isApiError(error) && error.kind === 'validation') {
      submitFieldErrors.value = fieldErrorsToMap(error);
      await revealErrors();
    }
  }
}
</script>

<template>
  <div ref="formElement">
    <ConfirmDialog
      v-model="leaveGuard.open.value"
      title="Hay cambios sin guardar"
      message="Si salís ahora, perderás los cambios que todavía no guardaste."
      confirm-text="Salir sin guardar"
      cancel-text="Seguir editando"
      color="warning"
      @confirm="leaveGuard.confirm"
      @cancel="leaveGuard.cancel"
    />
    <PageHeader
      :title="
        form.sale.value ? `Venta ${formatSaleNumber(form.sale.value.saleNumber)}` : 'Editar venta'
      "
      subtitle="Guardá tu avance con Guardar borrador o al cambiar de sección."
    >
      <template #actions>
        <div class="d-flex flex-wrap align-center ga-3">
          <StatusBadge v-if="form.sale.value" :status="form.sale.value.status" />
          <v-chip v-if="form.model.value" variant="tonal"
            >{{ form.model.value.members.length }}
            {{ form.model.value.members.length === 1 ? 'integrante' : 'integrantes' }}</v-chip
          >
          <SaleSaveStatus :status="form.saveStatus.value" :error-message="form.saveError.value" />
          <v-btn variant="text" :to="{ name: 'sales' }">Volver</v-btn>
        </div>
      </template>
    </PageHeader>

    <ErrorState
      v-if="form.saleQuery.error.value"
      :message="apiErrorMessage(form.saleQuery.error.value)"
      :request-id="
        isApiError(form.saleQuery.error.value) ? form.saleQuery.error.value.requestId : null
      "
      @retry="form.saleQuery.refetch()"
    />

    <v-alert
      v-if="form.versionConflict.value"
      type="warning"
      variant="tonal"
      class="mb-4"
      title="Conflicto de versión"
      :text="form.saveError.value ?? ''"
    >
      <template #append>
        <v-btn color="warning" variant="flat" @click="form.reloadFromServer()">
          Recuperar versión actual
        </v-btn>
      </template>
    </v-alert>

    <v-alert
      v-if="submitError || Object.keys(allFieldErrors).length"
      type="error"
      variant="tonal"
      class="mb-4"
      :title="submitError ?? 'Corregí los datos indicados antes de guardar o avanzar.'"
    >
      <ul v-if="Object.keys(allFieldErrors).length" class="mt-2 mb-0">
        <li v-for="(message, field) in allFieldErrors" :key="field">
          <strong>{{ saleFieldPathLabel(field) }}:</strong> {{ message }}
        </li>
      </ul>
    </v-alert>

    <SaleFormProgress
      v-if="form.model.value"
      :readiness="readiness"
      :sections="sections"
      @navigate="requestSection"
    />
    <v-row v-if="form.model.value" align="start">
      <v-col cols="12" md="3" class="d-none d-md-block">
        <v-card class="pa-2 position-sticky" style="top: 5rem">
          <SaleSectionNav
            :model-value="section"
            :sections="sections"
            :completion="readiness.bySection"
            @update:model-value="requestSection"
          />
        </v-card>
      </v-col>

      <v-col cols="12" md="9">
        <v-select
          :model-value="section"
          class="d-md-none mb-4"
          :items="sections"
          item-title="label"
          item-value="id"
          label="Sección"
          @update:model-value="requestSection"
        />

        <v-card class="pa-4 pa-md-6 mb-4">
          <div class="d-flex flex-wrap align-center justify-space-between ga-2 mb-3">
            <span class="text-caption text-medium-emphasis"
              >Paso {{ sections.findIndex((item) => item.id === section) + 1 }} de
              {{ sections.length }}</span
            >
            <v-chip
              v-if="readiness.bySection[section].total"
              :color="
                readiness.bySection[section].complete === readiness.bySection[section].total
                  ? 'success'
                  : 'secondary'
              "
              variant="tonal"
              >{{ readiness.bySection[section].complete }}/{{
                readiness.bySection[section].total
              }}
              completos</v-chip
            >
            <span v-else class="text-caption text-medium-emphasis">Opcional</span>
          </div>
          <template v-if="section === 'details'">
            <h2 class="text-h6 mb-4">Datos de la venta</h2>
            <v-row dense>
              <v-col cols="12" md="4">
                <v-select
                  v-model="form.model.value.healthInsurerId"
                  :items="insurerItems"
                  :loading="insurersQuery.isFetching.value"
                  label="Prepaga *"
                  required
                  :disabled="!form.editable.value"
                  v-bind="fieldProps('healthInsurerId')"
                  @update:model-value="clearFieldError('healthInsurerId')"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="form.model.value.customerType"
                  :items="CUSTOMER_TYPE_OPTIONS"
                  label="Tipo de venta *"
                  required
                  clearable
                  :disabled="!form.editable.value"
                  v-bind="fieldProps('customerType')"
                  @update:model-value="clearFieldError('customerType')"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="form.model.value.healthPlanId"
                  :items="planItems"
                  :loading="plansQuery.isFetching.value"
                  label="Plan *"
                  required
                  clearable
                  :disabled="
                    !form.editable.value ||
                    !form.model.value.healthInsurerId ||
                    plansQuery.isFetching.value
                  "
                  v-bind="fieldProps('healthPlanId')"
                  @update:model-value="clearFieldError('healthPlanId')"
                />
              </v-col>
            </v-row>
          </template>

          <template v-else-if="section === 'members'">
            <h2 class="text-h6 mb-2">Integrantes</h2>
            <p class="text-medium-emphasis mb-4">
              El titular está incluido. Sumá cónyuge e hijos según corresponda.
            </p>
            <v-alert
              v-if="allFieldErrors.members"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-4"
              :text="allFieldErrors.members"
            />
            <FamilyMemberCard
              v-if="holderIndex >= 0 && form.model.value.members[holderIndex]"
              :member="form.model.value.members[holderIndex]!"
              :index="holderIndex"
              :disabled="!form.editable.value"
              :field-errors="allFieldErrors"
              @update:member="updateMemberAt(holderIndex, $event)"
              @clear-field-error="clearFieldError"
            />
            <FamilyMemberCard
              v-for="row in spouseRows"
              :key="memberKey(row.member)"
              :member="row.member"
              :index="row.index"
              removable
              :disabled="!form.editable.value"
              :field-errors="allFieldErrors"
              @remove="removeMemberAt(row.index)"
              @update:member="updateMemberAt(row.index, $event)"
              @clear-field-error="clearFieldError"
            />
            <FamilyMemberCard
              v-for="(row, childIndex) in children"
              :key="memberKey(row.member)"
              :member="row.member"
              :index="row.index"
              :child-index="childIndex + 1"
              removable
              :disabled="!form.editable.value"
              :field-errors="allFieldErrors"
              @remove="removeMemberAt(row.index)"
              @update:member="updateMemberAt(row.index, $event)"
              @clear-field-error="clearFieldError"
            />
            <div v-if="form.editable.value" class="d-flex flex-wrap ga-2">
              <v-btn variant="tonal" :disabled="Boolean(spouse)" @click="addSpouse">
                + Cónyuge
              </v-btn>
              <v-btn variant="tonal" @click="addChild">+ Hijo/a</v-btn>
            </div>
          </template>

          <template v-else-if="section === 'contact'">
            <SaleContactFields
              v-model="form.model.value.contact"
              :disabled="!form.editable.value"
              :field-errors="allFieldErrors"
              @clear-field-error="clearFieldError"
            />
          </template>

          <template v-else-if="section === 'employment'">
            <SaleEmploymentFields
              v-model="form.model.value.employment"
              :disabled="!form.editable.value"
              :field-errors="allFieldErrors"
              @clear-field-error="clearFieldError"
            />
          </template>

          <template v-else-if="section === 'tax'">
            <SaleTaxFields
              v-model="form.model.value.taxInfo"
              :disabled="!form.editable.value"
              :field-errors="allFieldErrors"
              @clear-field-error="clearFieldError"
            />
          </template>

          <template v-else-if="section === 'billing'">
            <SaleBillingFields
              v-model="form.model.value.billing"
              :disabled="!form.editable.value"
              :field-errors="allFieldErrors"
              @clear-field-error="clearFieldError"
            />
            <SaleDocuments
              v-if="
                form.model.value.billing.paymentMethod === 'CARD' ||
                documentsQuery.data.value?.items.some((doc) =>
                  ['PAYMENT_PROOF', 'CARD_FRONT', 'CARD_BACK'].includes(doc.documentType),
                )
              "
              class="mt-4"
              purpose="billing"
              :sale-id="saleId"
              :documents="documentsQuery.data.value"
              :editable="form.editable.value"
              :disabled="
                form.hasUnsavedChanges.value ||
                form.saveStatus.value === 'saving' ||
                documentsQuery.isFetching.value ||
                Boolean(documentsQuery.error.value)
              "
              :requires-save="form.hasUnsavedChanges.value"
            />
          </template>

          <template v-else-if="section === 'documents'">
            <h2 class="text-h6 mb-2">Documentación respaldatoria</h2>
            <ErrorState
              v-if="documentsQuery.error.value"
              :message="apiErrorMessage(documentsQuery.error.value)"
              :loading="documentsQuery.isFetching.value"
              @retry="documentsQuery.refetch()"
            />
            <v-alert
              v-if="allFieldErrors.documents"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-4"
              :text="allFieldErrors.documents"
            />
            <SaleDocuments
              :sale-id="saleId"
              :documents="documentsQuery.data.value"
              :loading="documentsQuery.isFetching.value"
              :editable="form.editable.value"
              :disabled="
                form.hasUnsavedChanges.value ||
                form.saveStatus.value === 'saving' ||
                documentsQuery.isFetching.value ||
                Boolean(documentsQuery.error.value)
              "
              :requires-save="form.hasUnsavedChanges.value"
            />
          </template>

          <template v-else-if="section === 'notes'">
            <h2 class="text-h6 mb-4">Observaciones adicionales</h2>
            <v-textarea
              v-model="form.model.value.observations"
              label="Observaciones"
              rows="4"
              :disabled="!form.editable.value"
            />
          </template>
        </v-card>

        <v-card class="pa-4">
          <p class="text-body-2 text-medium-emphasis mb-3" role="status">{{ presentationHint }}</p>
          <div class="d-flex flex-wrap justify-space-between ga-2">
            <v-btn variant="tonal" :disabled="sections[0]?.id === section" @click="goSection(-1)">
              Anterior
            </v-btn>
            <div class="d-flex flex-wrap ga-2">
              <v-btn
                v-if="form.editable.value"
                variant="tonal"
                :loading="form.saveStatus.value === 'saving'"
                :disabled="form.saveStatus.value === 'saving'"
                @click="saveDraft()"
              >
                Guardar borrador
              </v-btn>
              <v-btn
                v-if="sections[sections.length - 1]?.id !== section"
                color="primary"
                :variant="canPresent ? 'tonal' : 'flat'"
                @click="goSection(1)"
              >
                Continuar
              </v-btn>
              <v-btn
                v-if="form.editable.value"
                :color="canPresent ? 'primary' : 'secondary'"
                :variant="canPresent ? 'flat' : 'outlined'"
                :loading="submitMutation.isPending.value"
                :disabled="!canPresent"
                @click="submitConfirm = true"
              >
                Presentar venta
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <ConfirmDialog
      v-model="submitConfirm"
      title="¿Presentar esta venta?"
      message="Se validará el formulario completo en el servidor. Las ventas presentadas pasan a estado Presentada."
      confirm-text="Presentar"
      @confirm="onSubmitConfirm"
    />
  </div>
</template>
