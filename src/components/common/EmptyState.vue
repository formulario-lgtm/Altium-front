<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string;
    text?: string;
    icon?: string;
    titleTag?: 'p' | 'h1' | 'h2';
    /** Less vertical padding for dashboard panels. */
    compact?: boolean;
  }>(),
  { text: undefined, icon: 'mdi-inbox-outline', titleTag: 'p', compact: false },
);
</script>

<template>
  <div class="text-center px-4" :class="compact ? 'py-6' : 'py-10'" role="status">
    <v-icon :icon="icon" :size="compact ? 36 : 40" class="text-medium-emphasis mb-3" />
    <component :is="titleTag" class="text-subtitle-1 font-weight-medium mb-1">{{
      title
    }}</component>
    <p v-if="text" class="text-body-2 text-medium-emphasis mb-0">{{ text }}</p>
    <div v-if="$slots.actions" class="mt-4 d-flex justify-center ga-2">
      <slot name="actions" />
    </div>
  </div>
</template>
