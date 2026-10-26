<script setup lang="ts">
import { useId } from 'vue';

defineProps<{ title: string; subtitle?: string }>();
const titleId = useId();
</script>

<template>
  <v-card tag="section" :aria-labelledby="titleId" class="d-flex flex-column w-100">
    <header class="d-flex flex-wrap align-center justify-space-between ga-2 pa-5 pb-3">
      <div class="home-panel__titles">
        <h2 :id="titleId" class="text-h6">{{ title }}</h2>
        <p v-if="subtitle" class="text-body-2 text-medium-emphasis mb-0">{{ subtitle }}</p>
      </div>
      <div v-if="$slots.actions" class="d-flex flex-wrap ga-2"><slot name="actions" /></div>
    </header>
    <v-card-text class="d-flex flex-column flex-grow-1 pt-0"><slot /></v-card-text>
  </v-card>
</template>

<style scoped lang="scss">
.home-panel__titles {
  flex: 1 1 12rem;
  min-width: 0;
  @media (max-width: 599.98px) {
    flex-basis: 100%;
  }
}
</style>
