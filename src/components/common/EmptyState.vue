<script setup lang="ts">
withDefaults(
  defineProps<{ title: string; text?: string; icon?: string; titleTag?: 'p' | 'h1' | 'h2' }>(),
  { text: undefined, icon: 'mdi-inbox-outline', titleTag: 'p' },
);
</script>

<template>
  <div class="text-center py-10 px-4" role="status">
    <v-icon :icon="icon" size="40" class="text-medium-emphasis mb-3" />
    <component :is="titleTag" class="text-subtitle-1 font-weight-medium mb-1">{{
      title
    }}</component>
    <p v-if="text" class="text-body-2 text-medium-emphasis mb-0">{{ text }}</p>
    <div v-if="$slots.actions" class="mt-4 d-flex justify-center ga-2">
      <slot name="actions" />
    </div>
  </div>
</template>
