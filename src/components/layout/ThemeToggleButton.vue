<script setup lang="ts">
import { computed } from 'vue';
import { useUiStore } from '@/stores/ui.store';

const uiStore = useUiStore();

const label = computed(() => (uiStore.isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'));
const icon = computed(() => (uiStore.isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'));
</script>

<template>
  <v-btn :aria-label="label" :title="label" icon variant="text" @click="uiStore.toggleTheme()">
    <v-icon :icon="icon" />
  </v-btn>
</template>
