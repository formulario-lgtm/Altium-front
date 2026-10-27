<script setup lang="ts">
import GlobalLoadingOverlay from '@/components/common/GlobalLoadingOverlay.vue';
import { useThemeSync } from '@/composables/useThemeSync';
import { useGlobalLoadingState } from '@/services/http/loading';

useThemeSync();
const { isLoading } = useGlobalLoadingState();
</script>

<template>
  <v-app>
    <div class="altium-route-content" :inert="isLoading" :aria-busy="isLoading">
      <router-view />
    </div>
    <GlobalLoadingOverlay />
  </v-app>
</template>

<style scoped>
.altium-route-content {
  display: contents;
}
</style>
