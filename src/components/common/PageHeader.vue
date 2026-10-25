<script setup lang="ts">
withDefaults(defineProps<{ title: string; subtitle?: string }>(), { subtitle: undefined });
</script>

<template>
  <header class="d-flex flex-wrap align-center ga-4 mb-6">
    <div class="flex-grow-1" style="min-width: 0">
      <slot name="prepend" />
      <h1 class="text-h5 font-weight-bold mb-1">{{ title }}</h1>
      <p v-if="subtitle" class="text-body-2 text-medium-emphasis mb-0">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="d-flex flex-wrap ga-2">
      <slot name="actions" />
    </div>
  </header>
</template>
