<script setup lang="ts">
export type SaleSectionId =
  'details' | 'members' | 'contact' | 'employment' | 'tax' | 'billing' | 'documents' | 'notes';

defineProps<{
  sections: { id: SaleSectionId; label: string }[];
  modelValue: SaleSectionId;
}>();

defineEmits<{
  'update:modelValue': [SaleSectionId];
}>();
</script>

<template>
  <nav class="sale-section-nav" aria-label="Secciones de la venta">
    <v-list density="compact" nav class="sale-section-nav__list">
      <v-list-item
        v-for="(section, index) in sections"
        :key="section.id"
        :active="modelValue === section.id"
        rounded="lg"
        color="primary"
        @click="$emit('update:modelValue', section.id)"
      >
        <template #prepend>
          <span class="sale-section-nav__step text-caption">{{
            String(index + 1).padStart(2, '0')
          }}</span>
        </template>
        <v-list-item-title>{{ section.label }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </nav>
</template>

<style scoped lang="scss">
.sale-section-nav__list {
  background: transparent;
}

.sale-section-nav__step {
  width: 1.75rem;
  color: rgb(var(--v-theme-on-surface-variant));
  font-weight: 700;
}
</style>
