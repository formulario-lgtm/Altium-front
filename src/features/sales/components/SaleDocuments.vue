<script setup lang="ts">
import { computed, ref } from 'vue';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';
import {
  apiErrorMessage,
  type RequiredDocumentCategory,
  type SaleDocumentMeta,
  type SaleDocuments,
} from '@/services/http';
import {
  useDeleteSaleDocumentMutation,
  useDownloadSaleDocumentMutation,
  useUploadSaleDocumentMutation,
} from '../composables/useSales';
import {
  documentStatusLabel,
  documentTypeLabel,
  formatFileSize,
  SALE_DOCUMENT_ACCEPT,
  SALE_DOCUMENT_MAX_BYTES,
} from '../utils/sale-labels';

const props = withDefaults(
  defineProps<{
    saleId: string;
    documents: SaleDocuments | null | undefined;
    loading?: boolean;
    editable?: boolean;
    disabled?: boolean;
    requiresSave?: boolean;
    purpose?: 'documentation' | 'billing';
  }>(),
  {
    loading: false,
    editable: false,
    disabled: false,
    requiresSave: false,
    purpose: 'documentation',
  },
);

const uploadMutation = useUploadSaleDocumentMutation(() => props.saleId);
const deleteMutation = useDeleteSaleDocumentMutation(() => props.saleId);
const downloadMutation = useDownloadSaleDocumentMutation(() => props.saleId);

const busyCategoryKey = ref<string | null>(null);
const actionError = ref<string | null>(null);
const deleteTarget = ref<SaleDocumentMeta | null>(null);
const deleteOpen = ref(false);

type UploadCategory = RequiredDocumentCategory & { required: boolean; allowUpload: boolean };
const categories = computed<UploadCategory[]>(() => {
  if (!props.documents) return [];
  const inSection = (type: string) =>
    props.purpose === 'billing'
      ? ['CARD_FRONT', 'CARD_BACK', 'PAYMENT_PROOF'].includes(type)
      : !['CARD_FRONT', 'CARD_BACK', 'PAYMENT_PROOF'].includes(type);
  const result: UploadCategory[] = props.documents.requiredCategories
    .filter(
      (category) => inSection(category.documentType) && category.documentType !== 'PAYMENT_PROOF',
    )
    .map((category) => ({ ...category, required: true, allowUpload: true }));
  if (props.purpose === 'documentation') {
    result.push({
      documentType: 'OTHER',
      label: 'Otra documentación',
      saleMemberId: null,
      satisfied: false,
      required: false,
      allowUpload: true,
    });
  }
  for (const doc of props.documents.items.filter((doc) => inSection(doc.documentType))) {
    if (
      !result.some(
        (category) =>
          category.documentType === doc.documentType &&
          (category.saleMemberId ?? null) === (doc.saleMemberId ?? null),
      )
    ) {
      result.push({
        documentType: doc.documentType,
        saleMemberId: doc.saleMemberId,
        label:
          doc.documentType === 'PAYMENT_PROOF'
            ? 'Archivo de cobranza existente'
            : documentTypeLabel(doc.documentType),
        satisfied: false,
        required: false,
        allowUpload: doc.documentType !== 'PAYMENT_PROOF',
      });
    }
  }
  return result;
});
const items = computed(() => props.documents?.items ?? []);

function categoryKey(category: RequiredDocumentCategory): string {
  return `${category.documentType}:${category.saleMemberId ?? 'sale'}`;
}

function docsForCategory(category: RequiredDocumentCategory): SaleDocumentMeta[] {
  return items.value.filter(
    (doc) =>
      doc.documentType === category.documentType &&
      (doc.saleMemberId ?? null) === (category.saleMemberId ?? null),
  );
}

function pickFile(category: RequiredDocumentCategory): void {
  if (!props.editable || props.disabled || uploadMutation.isPending.value) return;
  actionError.value = null;
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = ['CARD_FRONT', 'CARD_BACK'].includes(category.documentType)
    ? 'image/jpeg,image/png'
    : SALE_DOCUMENT_ACCEPT;
  input.onchange = () => {
    const file = input.files?.[0];
    if (file) void uploadFile(category, file);
  };
  input.click();
}

async function uploadFile(category: RequiredDocumentCategory, file: File): Promise<void> {
  if (!props.editable || props.disabled) return;
  if (file.size > SALE_DOCUMENT_MAX_BYTES) {
    actionError.value = 'El archivo supera el máximo de 10 MB.';
    return;
  }
  busyCategoryKey.value = categoryKey(category);
  actionError.value = null;
  try {
    await uploadMutation.mutateAsync({
      file,
      documentType: category.documentType,
      saleMemberId: category.saleMemberId,
    });
  } catch (error) {
    actionError.value = apiErrorMessage(error);
  } finally {
    busyCategoryKey.value = null;
  }
}

function askDelete(doc: SaleDocumentMeta): void {
  deleteTarget.value = doc;
  deleteMutation.reset();
  deleteOpen.value = true;
}

async function confirmDelete(): Promise<void> {
  if (!deleteTarget.value) return;
  try {
    await deleteMutation.mutateAsync(deleteTarget.value.id);
    deleteOpen.value = false;
    deleteTarget.value = null;
  } catch {
    // Error shown in dialog.
  }
}

async function downloadDoc(doc: SaleDocumentMeta): Promise<void> {
  actionError.value = null;
  try {
    await downloadMutation.mutateAsync({
      documentId: doc.id,
      filename: doc.originalFilename,
    });
  } catch (error) {
    actionError.value = apiErrorMessage(error);
  }
}
</script>

<template>
  <div>
    <v-alert v-if="requiresSave" type="info" density="compact" class="mb-4">
      Guardá el borrador para actualizar los requisitos y habilitar la carga de archivos.
    </v-alert>
    <p class="text-body-2 text-medium-emphasis mb-4">
      Adjuntá JPEG, PNG o PDF (máx. 10 MB). Los archivos se guardan de forma privada en el
      almacenamiento de Altium.<template v-if="purpose === 'billing'">
        Para la tarjeta, usá imágenes JPEG o PNG.</template
      >
    </p>

    <v-alert
      v-if="actionError"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-4"
      role="alert"
    >
      {{ actionError }}
    </v-alert>

    <v-progress-linear
      v-if="loading && !categories.length"
      indeterminate
      color="primary"
      class="mb-3"
    />

    <div v-else-if="categories.length" class="d-flex flex-column ga-3">
      <v-card
        v-for="category in categories"
        :key="categoryKey(category)"
        :data-testid="`sale-document-${categoryKey(category)}`"
        variant="outlined"
        class="pa-3 pa-sm-4"
      >
        <div class="d-flex flex-wrap align-start justify-space-between ga-3 mb-2">
          <div class="min-w-0">
            <p class="text-subtitle-2 font-weight-medium mb-1">
              {{ category.label }}<span v-if="category.required"> *</span>
            </p>
            <div class="d-flex flex-wrap align-center ga-2">
              <v-chip
                size="small"
                :color="
                  category.required ? (category.satisfied ? 'success' : 'warning') : 'secondary'
                "
                variant="tonal"
              >
                {{
                  category.required ? (category.satisfied ? 'Completo' : 'Pendiente') : 'Opcional'
                }}
              </v-chip>
            </div>
          </div>
          <v-btn
            v-if="editable && category.allowUpload"
            color="primary"
            variant="tonal"
            prepend-icon="mdi-upload"
            :loading="busyCategoryKey === categoryKey(category)"
            :disabled="disabled || uploadMutation.isPending.value"
            @click="pickFile(category)"
          >
            {{ docsForCategory(category).length ? 'Agregar archivo' : 'Subir archivo' }}
          </v-btn>
        </div>

        <v-list
          v-if="docsForCategory(category).length"
          density="compact"
          class="bg-transparent pa-0"
        >
          <v-list-item v-for="doc in docsForCategory(category)" :key="doc.id" class="px-0">
            <v-list-item-title class="text-wrap">
              {{ doc.originalFilename || 'Archivo sin nombre' }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ documentStatusLabel(doc.status) }}
              ·
              {{ formatFileSize(doc.fileSize) }}
            </v-list-item-subtitle>
            <template #append>
              <div class="d-flex align-center ga-1">
                <v-btn
                  icon="mdi-download"
                  variant="text"
                  size="small"
                  aria-label="Descargar"
                  :loading="
                    downloadMutation.isPending.value &&
                    downloadMutation.variables.value?.documentId === doc.id
                  "
                  @click="downloadDoc(doc)"
                />
                <v-btn
                  v-if="editable"
                  icon="mdi-delete-outline"
                  variant="text"
                  size="small"
                  color="error"
                  :disabled="disabled || uploadMutation.isPending.value"
                  aria-label="Eliminar"
                  @click="askDelete(doc)"
                />
              </div>
            </template>
          </v-list-item>
        </v-list>
        <p v-else class="text-body-2 text-medium-emphasis mb-0">Todavía no hay archivo adjunto.</p>
      </v-card>
    </div>

    <p v-else class="text-medium-emphasis mb-0">
      Las categorías aparecerán según el tipo de venta y el grupo familiar.
    </p>

    <ConfirmDialog
      v-model="deleteOpen"
      title="Eliminar documento"
      :message="
        deleteTarget
          ? `¿Eliminar «${deleteTarget.originalFilename || 'archivo'}»? Esta acción no se puede deshacer.`
          : undefined
      "
      confirm-text="Eliminar"
      color="error"
      :loading="deleteMutation.isPending.value"
      :error-message="
        deleteMutation.error.value ? apiErrorMessage(deleteMutation.error.value) : null
      "
      @confirm="confirmDelete"
    />
  </div>
</template>
