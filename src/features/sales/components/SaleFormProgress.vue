<script setup lang="ts">
import { computed, ref } from 'vue';
import type { getSaleReadiness } from '../utils/sale-readiness';
import type { SaleSectionId } from './SaleSectionNav.vue';

const props = defineProps<{
  readiness: ReturnType<typeof getSaleReadiness>;
  sections: { id: SaleSectionId; label: string }[];
}>();
const emit = defineEmits<{ navigate: [SaleSectionId] }>();
const expanded = ref(false);
const pendingSections = computed(() =>
  props.sections.filter((section) =>
    props.readiness.pending.some((item) => item.section === section.id),
  ),
);
</script>

<template>
  <v-card class="mb-5" data-testid="sale-completion">
    <v-card-text>
      <div class="d-flex flex-wrap align-center justify-space-between ga-3 mb-3">
        <div>
          <h2 class="text-subtitle-1 font-weight-bold">
            {{ readiness.ready ? 'Datos obligatorios completos' : 'Tu venta, paso a paso' }}
          </h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ readiness.complete }} de {{ readiness.total }} requisitos completos · Los campos con
            * son obligatorios.
          </p>
        </div>
        <v-btn
          v-if="!readiness.ready"
          variant="tonal"
          color="primary"
          :aria-expanded="expanded"
          @click="expanded = !expanded"
          >{{
            expanded ? 'Ocultar pendientes' : `Ver pendientes (${readiness.pending.length})`
          }}</v-btn
        >
        <v-icon v-else icon="mdi-check-circle-outline" color="success" />
      </div>
      <v-progress-linear
        :model-value="readiness.percent"
        color="primary"
        height="6"
        rounded
        aria-label="Requisitos completos de la venta"
      />
      <v-list
        v-if="expanded"
        class="bg-transparent pa-0 mt-3"
        lines="two"
        aria-label="Datos pendientes"
      >
        <v-list-item
          v-for="section in pendingSections"
          :key="section.id"
          :value="section.id"
          append-icon="mdi-chevron-right"
          @click="
            expanded = false;
            emit('navigate', section.id);
          "
        >
          <v-list-item-title class="text-wrap">{{ section.label }}</v-list-item-title>
          <v-list-item-subtitle class="text-wrap">{{
            readiness.pending
              .filter((item) => item.section === section.id)
              .map((item) => item.label)
              .join(' · ')
          }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>
