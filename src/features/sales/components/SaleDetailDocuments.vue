<script setup lang="ts">
import { computed } from 'vue';
import type { Sale, SaleDocuments } from '@/services/http';
import EmptyState from '@/components/common/EmptyState.vue';
import ErrorState from '@/components/common/ErrorState.vue';
import {
  documentStatusLabel,
  documentTypeLabel,
  formatFileSize,
  memberTypeLabel,
} from '../utils/sale-labels';
import { formatDateTime } from '@/utils/format';

const props = defineProps<{
  documents?: SaleDocuments;
  members?: Readonly<Sale['members']>;
  loading: boolean;
  error?: string;
  downloadError?: string;
  downloadingId?: string;
  downloadingAll?: boolean;
}>();
defineEmits<{
  retry: [];
  'download-all': [];
  download: [document: { documentId: string; filename: string }];
}>();
const categories = computed(() => props.documents?.requiredCategories ?? []);
const completed = computed(() => categories.value.filter((category) => category.satisfied).length);
function documentOwner(memberId: string | null) {
  const member = props.members?.find((member) => member.id === memberId);
  if (!member) return null;
  return [
    memberTypeLabel(member.memberType),
    [member.firstName, member.lastName].filter(Boolean).join(' '),
  ]
    .filter(Boolean)
    .join(' · ');
}
</script>

<template>
  <v-card class="pa-4 pa-md-5" data-testid="sale-detail-documents">
    <div class="d-flex flex-wrap justify-space-between align-start ga-3 mb-4">
      <div>
        <h2 class="text-h6 mb-1">
          <v-icon
            icon="mdi-file-document-outline"
            size="22"
            class="mr-2 text-primary"
          />Documentación
        </h2>
        <p class="text-body-2 text-medium-emphasis mb-0">Requisitos y archivos de esta venta.</p>
      </div>
      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-folder-download-outline"
        :loading="downloadingAll"
        :disabled="
          loading ||
          Boolean(error) ||
          Boolean(downloadingId) ||
          !documents?.items.some((doc) => doc.status === 'UPLOADED')
        "
        @click="$emit('download-all')"
        >Descargar todo</v-btn
      >
    </div>
    <ErrorState v-if="error" :message="error" @retry="$emit('retry')" />
    <v-progress-linear
      v-else-if="loading && !documents"
      indeterminate
      color="primary"
      aria-label="Cargando documentación"
    />
    <template v-else-if="documents">
      <template v-if="categories.length">
        <div class="d-flex justify-space-between align-center ga-2 mb-2">
          <span class="text-body-2">Obligatorios completos</span>
          <span class="text-body-2 font-weight-bold"
            >{{ completed }} de {{ categories.length }}</span
          >
        </div>
        <v-progress-linear
          :model-value="(completed / categories.length) * 100"
          :color="completed === categories.length ? 'success' : 'primary'"
          height="6"
          rounded
          class="mb-4"
          aria-label="Documentos obligatorios completos"
        />
        <ul class="sale-document-requirements mb-4">
          <li
            v-for="category in categories"
            :key="`${category.documentType}-${category.saleMemberId ?? 'sale'}`"
            class="d-flex align-start ga-2 py-2 text-body-2"
          >
            <v-icon
              :icon="category.satisfied ? 'mdi-check-circle-outline' : 'mdi-clock-outline'"
              :color="category.satisfied ? 'success' : 'warning'"
              size="18"
              class="mt-1"
            />
            <span class="flex-grow-1">{{ category.label }}</span>
            <span
              :class="category.satisfied ? 'text-success' : 'text-warning'"
              class="text-caption"
              >{{ category.satisfied ? 'Completo' : 'Pendiente' }}</span
            >
          </li>
        </ul>
      </template>
      <v-divider v-if="categories.length && documents.items.length" class="mb-4" />
      <h3 v-if="documents.items.length" class="text-subtitle-2 mb-2">
        Archivos adjuntos ({{ documents.items.length }})
      </h3>
      <v-list v-if="documents.items.length" class="bg-transparent pa-0" density="compact">
        <v-list-item v-for="doc in documents.items" :key="doc.id" class="px-0 py-2">
          <v-list-item-title class="text-body-2 sale-document-name">{{
            doc.originalFilename || 'Archivo'
          }}</v-list-item-title>
          <p class="text-body-2 text-medium-emphasis text-break mt-1 mb-0">
            {{ documentTypeLabel(doc.documentType)
            }}<template v-if="documentOwner(doc.saleMemberId)">
              · {{ documentOwner(doc.saleMemberId) }}</template
            >
          </p>
          <p class="text-caption text-medium-emphasis text-break mb-0">
            Estado: {{ documentStatusLabel(doc.status) }} · {{ formatDateTime(doc.createdAt)
            }}<template v-if="doc.fileSize != null"> · {{ formatFileSize(doc.fileSize) }}</template>
          </p>
          <template #append>
            <v-btn
              icon="mdi-download"
              variant="text"
              size="small"
              :aria-label="`Descargar ${doc.originalFilename || 'archivo'}`"
              :loading="downloadingId === doc.id"
              :disabled="downloadingAll || doc.status !== 'UPLOADED'"
              @click="
                $emit('download', {
                  documentId: doc.id,
                  filename: doc.originalFilename || 'Archivo',
                })
              "
            />
          </template>
        </v-list-item>
      </v-list>
      <EmptyState
        v-else
        compact
        title="Sin archivos adjuntos"
        text="Todavía no se cargó documentación."
        icon="mdi-file-outline"
      />
    </template>
    <v-alert v-if="downloadError" type="error" class="mt-3" :text="downloadError" />
  </v-card>
</template>

<style scoped>
.sale-document-requirements {
  list-style: none;
  padding: 0;
}
.sale-document-requirements li > .flex-grow-1 {
  min-width: 0;
  overflow-wrap: anywhere;
}
.sale-document-name {
  white-space: normal;
  overflow-wrap: anywhere;
}
</style>
