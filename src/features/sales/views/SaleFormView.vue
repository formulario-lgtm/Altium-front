<script setup lang="ts">
import { computed, ref, watch } from 'vue';
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
import FamilyMemberCard from '../components/FamilyMemberCard.vue';
import SaleDocuments from '../components/SaleDocuments.vue';
import SaleSaveStatus from '../components/SaleSaveStatus.vue';
import SaleSectionNav, { type SaleSectionId } from '../components/SaleSectionNav.vue';
import { useSaleForm } from '../composables/useSaleForm';
import {
  useHealthInsurersQuery,
  useHealthPlansQuery,
  useSaleDocumentsQuery,
  useSubmitSaleMutation,
} from '../composables/useSales';
import { emptyMember } from '../utils/sale-form-model';
import {
  ARGENTINA_PROVINCES,
  CUSTOMER_TYPE_OPTIONS,
  MONOTAX_CATEGORIES,
  PAYMENT_METHOD_OPTIONS,
} from '../utils/sale-labels';

const route = useRoute();
const router = useRouter();
const saleId = computed(() => String(route.params.id));

const form = useSaleForm(saleId);
const insurersQuery = useHealthInsurersQuery();
const plansQuery = useHealthPlansQuery(computed(() => form.model.value?.healthInsurerId ?? null));
const documentsQuery = useSaleDocumentsQuery(saleId);
const submitMutation = useSubmitSaleMutation();

const section = ref<SaleSectionId>('details');
const submitConfirm = ref(false);
const submitError = ref<string | null>(null);
const submitFieldErrors = ref<Record<string, string>>({});

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

watch(section, async (next, prev) => {
  if (prev && next !== prev && form.editable.value) {
    await form.persist();
  }
});

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
    title: `${row.code} — ${row.name}`,
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
  if (next) section.value = next;
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
  form.model.value.members[index] = member;
}

function addEmployer(): void {
  if (!form.model.value) return;
  form.model.value.employment.employers.push({
    employerCuit: '',
    displayOrder: form.model.value.employment.employers.length,
  });
}

function sectionForField(field: string): SaleSectionId {
  if (field.startsWith('members')) return 'members';
  if (field.startsWith('contact')) return 'contact';
  if (field.startsWith('employment')) return 'employment';
  if (field.startsWith('taxInfo')) return 'tax';
  if (field.startsWith('billing')) return 'billing';
  return 'details';
}

async function onSubmitConfirm(): Promise<void> {
  submitConfirm.value = false;
  submitError.value = null;
  submitFieldErrors.value = {};
  await form.persist();
  if (form.versionConflict.value) return;
  try {
    const sale = await submitMutation.mutateAsync(saleId.value);
    await router.push({ name: 'sale-detail', params: { id: sale.id } });
  } catch (error: unknown) {
    submitError.value = apiErrorMessage(error);
    if (isApiError(error) && error.kind === 'validation') {
      submitFieldErrors.value = fieldErrorsToMap(error);
      const firstField = Object.keys(submitFieldErrors.value)[0];
      if (firstField) section.value = sectionForField(firstField);
    }
  }
}
</script>

<template>
  <div>
    <PageHeader
      :title="form.sale.value?.saleNumber ?? 'Editar venta'"
      subtitle="Completá las secciones. El borrador se guarda automáticamente."
    >
      <template #actions>
        <div class="d-flex flex-wrap align-center ga-3">
          <StatusBadge v-if="form.sale.value" :status="form.sale.value.status" />
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
      v-if="submitError"
      type="error"
      variant="tonal"
      class="mb-4"
      :title="submitError"
      closable
      @click:close="submitError = null"
    >
      <ul v-if="Object.keys(submitFieldErrors).length" class="mt-2 mb-0">
        <li v-for="(message, field) in submitFieldErrors" :key="field">
          <strong>{{ field }}:</strong> {{ message }}
        </li>
      </ul>
    </v-alert>

    <v-row v-if="form.model.value" align="start">
      <v-col cols="12" md="3" class="d-none d-md-block">
        <v-card class="pa-2 position-sticky" style="top: 1rem">
          <SaleSectionNav v-model="section" :sections="sections" />
        </v-card>
      </v-col>

      <v-col cols="12" md="9">
        <v-select
          v-model="section"
          class="d-md-none mb-4"
          :items="sections"
          item-title="label"
          item-value="id"
          label="Sección"
        />

        <v-card class="pa-4 pa-md-6 mb-4">
          <template v-if="section === 'details'">
            <h2 class="text-h6 mb-4">Datos de la venta</h2>
            <v-row dense>
              <v-col cols="12" md="4">
                <v-select
                  v-model="form.model.value.healthInsurerId"
                  :items="insurerItems"
                  :loading="insurersQuery.isFetching.value"
                  label="Prepaga"
                  :disabled="!form.editable.value"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="form.model.value.customerType"
                  :items="CUSTOMER_TYPE_OPTIONS"
                  label="Tipo de venta"
                  clearable
                  :disabled="!form.editable.value"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="form.model.value.healthPlanId"
                  :items="planItems"
                  :loading="plansQuery.isFetching.value"
                  label="Plan"
                  clearable
                  :disabled="!form.editable.value || !form.model.value.healthInsurerId"
                />
              </v-col>
            </v-row>
          </template>

          <template v-else-if="section === 'members'">
            <h2 class="text-h6 mb-2">Integrantes</h2>
            <p class="text-medium-emphasis mb-4">
              El titular está incluido. Sumá cónyuge e hijos según corresponda.
            </p>
            <FamilyMemberCard
              v-if="holderIndex >= 0 && form.model.value.members[holderIndex]"
              :member="form.model.value.members[holderIndex]!"
              :index="holderIndex"
              :disabled="!form.editable.value"
              @update:member="updateMemberAt(holderIndex, $event)"
            />
            <FamilyMemberCard
              v-for="row in spouseRows"
              :key="row.member.id ?? `spouse-${row.index}`"
              :member="row.member"
              :index="row.index"
              removable
              :disabled="!form.editable.value"
              @remove="removeMemberAt(row.index)"
              @update:member="updateMemberAt(row.index, $event)"
            />
            <FamilyMemberCard
              v-for="(row, childIndex) in children"
              :key="row.member.id ?? `child-${row.index}`"
              :member="row.member"
              :index="row.index"
              :child-index="childIndex + 1"
              removable
              :disabled="!form.editable.value"
              @remove="removeMemberAt(row.index)"
              @update:member="updateMemberAt(row.index, $event)"
            />
            <div v-if="form.editable.value" class="d-flex flex-wrap ga-2">
              <v-btn variant="tonal" :disabled="Boolean(spouse)" @click="addSpouse">
                + Cónyuge
              </v-btn>
              <v-btn variant="tonal" @click="addChild">+ Hijo/a</v-btn>
            </div>
          </template>

          <template v-else-if="section === 'contact'">
            <h2 class="text-h6 mb-4">Contacto y domicilio</h2>
            <v-row dense>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="form.model.value.contact.areaCode"
                  label="Código de área"
                  :disabled="!form.editable.value"
                />
              </v-col>
              <v-col cols="12" md="3">
                <v-text-field
                  v-model="form.model.value.contact.phone"
                  label="Teléfono"
                  :disabled="!form.editable.value"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.model.value.contact.email"
                  label="Email"
                  type="email"
                  :disabled="!form.editable.value"
                />
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="form.model.value.contact.address"
                  label="Domicilio"
                  :disabled="!form.editable.value"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.model.value.contact.postalCode"
                  label="Código postal"
                  :disabled="!form.editable.value"
                />
              </v-col>
              <v-col cols="12" md="8">
                <v-select
                  v-model="form.model.value.contact.province"
                  :items="ARGENTINA_PROVINCES"
                  label="Provincia"
                  clearable
                  :disabled="!form.editable.value"
                />
              </v-col>
            </v-row>
          </template>

          <template v-else-if="section === 'employment'">
            <h2 class="text-h6 mb-4">Situación laboral</h2>
            <div
              v-for="(employer, index) in form.model.value.employment.employers"
              :key="employer.id ?? index"
              class="d-flex ga-2 align-center mb-2"
            >
              <v-text-field
                v-model="employer.employerCuit"
                :label="`CUIT empleador ${index + 1}`"
                maxlength="11"
                :disabled="!form.editable.value"
              />
              <v-btn
                v-if="index > 0 && form.editable.value"
                icon="mdi-close"
                variant="text"
                aria-label="Quitar empleador"
                @click="form.model.value.employment.employers.splice(index, 1)"
              />
            </div>
            <v-btn v-if="form.editable.value" class="mb-4" variant="tonal" @click="addEmployer">
              + Agregar CUIT empleador
            </v-btn>
            <v-row dense>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.model.value.employment.currentInsurance"
                  label="Obra social actual"
                  :disabled="!form.editable.value"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  :model-value="form.model.value.employment.grossSalary ?? ''"
                  type="number"
                  label="Sueldo bruto (s/ aporte)"
                  step="0.01"
                  :disabled="!form.editable.value"
                  @update:model-value="
                    form.model.value!.employment.grossSalary = $event === '' ? null : Number($event)
                  "
                />
              </v-col>
            </v-row>
          </template>

          <template v-else-if="section === 'tax'">
            <h2 class="text-h6 mb-4">Situación impositiva</h2>
            <v-row dense>
              <v-col cols="12" md="4">
                <v-select
                  v-model="form.model.value.taxInfo.monotaxCategory"
                  :items="MONOTAX_CATEGORIES"
                  label="Categoría de monotributo"
                  clearable
                  :disabled="!form.editable.value"
                />
              </v-col>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="form.model.value.taxInfo.currentInsurance"
                  label="Obra social actual"
                  :disabled="!form.editable.value"
                />
              </v-col>
            </v-row>
          </template>

          <template v-else-if="section === 'billing'">
            <h2 class="text-h6 mb-2">Cobranza y facturación</h2>
            <v-alert type="info" variant="tonal" class="mb-4" density="compact">
              No se aceptan número completo de tarjeta, CVV ni CBU en texto plano. La tokenización y
              el cifrado de CBU están pendientes en el backend.
            </v-alert>
            <v-row dense>
              <v-col cols="12" md="4">
                <v-select
                  v-model="form.model.value.billing.paymentMethod"
                  :items="PAYMENT_METHOD_OPTIONS"
                  label="Forma de pago"
                  clearable
                  :disabled="!form.editable.value"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-select
                  :model-value="
                    form.model.value.billing.holderIsPayer === null
                      ? null
                      : form.model.value.billing.holderIsPayer
                        ? 'Si'
                        : 'No'
                  "
                  :items="['Si', 'No']"
                  label="¿El titular es el pagador?"
                  clearable
                  :disabled="!form.editable.value"
                  @update:model-value="
                    form.model.value!.billing.holderIsPayer =
                      $event === 'Si' ? true : $event === 'No' ? false : null
                  "
                />
              </v-col>
            </v-row>

            <template v-if="form.model.value.billing.holderIsPayer === true">
              <v-text-field
                v-model="form.model.value.billing.paymentMedium"
                class="mt-2"
                label="Medio de pago"
                :disabled="!form.editable.value"
              />
              <v-alert
                v-if="form.model.value.billing.paymentMethod === 'CBU'"
                type="warning"
                variant="tonal"
                class="mt-2"
                title="CBU pendiente de captura segura"
                text="El backend aún no permite almacenar CBU. No se envía ni se guarda en el navegador."
              />
              <v-row v-if="form.model.value.billing.paymentMethod === 'CARD'" dense class="mt-2">
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="form.model.value.billing.cardBrand"
                    label="Marca de tarjeta"
                    :disabled="!form.editable.value"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-text-field
                    v-model="form.model.value.billing.cardLastFour"
                    label="Últimos 4 dígitos"
                    maxlength="4"
                    :disabled="!form.editable.value"
                  />
                </v-col>
                <v-col cols="6" md="2">
                  <v-text-field
                    :model-value="form.model.value.billing.cardExpiryMonth ?? ''"
                    type="number"
                    label="Mes"
                    min="1"
                    max="12"
                    :disabled="!form.editable.value"
                    @update:model-value="
                      form.model.value!.billing.cardExpiryMonth =
                        $event === '' ? null : Number($event)
                    "
                  />
                </v-col>
                <v-col cols="6" md="2">
                  <v-text-field
                    :model-value="form.model.value.billing.cardExpiryYear ?? ''"
                    type="number"
                    label="Año"
                    :disabled="!form.editable.value"
                    @update:model-value="
                      form.model.value!.billing.cardExpiryYear =
                        $event === '' ? null : Number($event)
                    "
                  />
                </v-col>
              </v-row>
            </template>

            <v-row v-else-if="form.model.value.billing.holderIsPayer === false" dense class="mt-2">
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.model.value.billing.payerIdentifier"
                  label="CUIT / CUIL del pagador"
                  maxlength="11"
                  :disabled="!form.editable.value"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.model.value.billing.payerEmail"
                  label="Email del pagador"
                  type="email"
                  :disabled="!form.editable.value"
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-text-field
                  v-model="form.model.value.billing.payerPhone"
                  label="Teléfono del pagador"
                  :disabled="!form.editable.value"
                />
              </v-col>
            </v-row>
          </template>

          <template v-else-if="section === 'documents'">
            <h2 class="text-h6 mb-2">Documentación respaldatoria</h2>
            <SaleDocuments
              :documents="documentsQuery.data.value"
              :loading="documentsQuery.isFetching.value"
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

        <div class="d-flex flex-wrap justify-space-between ga-2">
          <v-btn variant="tonal" :disabled="sections[0]?.id === section" @click="goSection(-1)">
            Anterior
          </v-btn>
          <div class="d-flex flex-wrap ga-2">
            <v-btn
              v-if="form.editable.value"
              variant="tonal"
              :loading="form.saveStatus.value === 'saving'"
              @click="form.persist()"
            >
              Guardar borrador
            </v-btn>
            <v-btn
              v-if="sections[sections.length - 1]?.id !== section"
              color="primary"
              variant="tonal"
              @click="goSection(1)"
            >
              Continuar
            </v-btn>
            <v-btn
              v-if="form.editable.value"
              color="primary"
              :loading="submitMutation.isPending.value"
              @click="submitConfirm = true"
            >
              Presentar venta
            </v-btn>
          </div>
        </div>
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
