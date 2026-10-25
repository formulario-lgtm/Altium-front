<script setup lang="ts">
import type { SaleDocuments } from '@/services/http';

defineProps<{
  documents: SaleDocuments | null | undefined;
  loading?: boolean;
}>();
</script>

<template>
  <div>
    <v-alert type="info" variant="tonal" class="mb-4" density="compact">
      Pendiente de integración con almacenamiento de objetos. No se suben archivos ni se convierten
      a Base64.
    </v-alert>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mb-3" />

    <v-list v-else-if="documents?.requiredCategories.length" lines="two">
      <v-list-item
        v-for="category in documents.requiredCategories"
        :key="`${category.documentType}-${category.saleMemberId ?? 'sale'}`"
      >
        <v-list-item-title>{{ category.label }}</v-list-item-title>
        <v-list-item-subtitle>Pendiente de integración</v-list-item-subtitle>
        <template #append>
          <v-chip size="small" variant="tonal">{{ category.documentType }}</v-chip>
        </template>
      </v-list-item>
    </v-list>

    <p v-else class="text-medium-emphasis mb-0">
      Las categorías aparecerán según el tipo de venta y el grupo familiar.
    </p>
  </div>
</template>
