<script setup lang="ts">
defineProps<{
  fields: { label: string; value: string | number | null | undefined }[];
  wide?: boolean;
}>();
</script>

<template>
  <dl class="sale-detail-fields" :class="{ 'sale-detail-fields-wide': wide }">
    <div v-for="field in fields" :key="field.label">
      <dt class="text-caption text-medium-emphasis mb-1">{{ field.label }}</dt>
      <dd
        class="text-body-2"
        :class="{ 'text-medium-emphasis': field.value == null || field.value === '' }"
      >
        {{ field.value == null || field.value === '' ? 'Sin completar' : field.value }}
      </dd>
    </div>
  </dl>
</template>

<style scoped>
.sale-detail-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 24px;
}
dd {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
@media (min-width: 960px) {
  .sale-detail-fields-wide {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
@media (max-width: 599px) {
  .sale-detail-fields {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }
}
</style>
