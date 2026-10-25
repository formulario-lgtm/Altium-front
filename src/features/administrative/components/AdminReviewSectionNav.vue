<script setup lang="ts">
export type AdminReviewSectionId =
  | 'summary'
  | 'details'
  | 'members'
  | 'contact'
  | 'employment'
  | 'billing'
  | 'documents'
  | 'observations'
  | 'followUps'
  | 'history';

defineProps<{
  sections: { id: AdminReviewSectionId; label: string }[];
  modelValue: AdminReviewSectionId;
}>();

defineEmits<{
  'update:modelValue': [AdminReviewSectionId];
}>();
</script>

<template>
  <nav class="admin-review-nav" aria-label="Secciones de revisión">
    <v-list density="compact" nav class="bg-transparent">
      <v-list-item
        v-for="section in sections"
        :key="section.id"
        :active="modelValue === section.id"
        rounded="lg"
        color="primary"
        @click="$emit('update:modelValue', section.id)"
      >
        <v-list-item-title>{{ section.label }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </nav>
</template>
