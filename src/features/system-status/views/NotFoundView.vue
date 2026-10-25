<script setup lang="ts">
import { useThemeSync } from '@/composables/useThemeSync';

useThemeSync();
</script>

<template>
  <v-app>
    <v-main class="d-flex align-center justify-center">
      <div class="text-center pa-6">
        <p class="altium-brand text-primary mb-6">Altium</p>
        <h1 class="text-h4 mb-2">Página no encontrada</h1>
        <p class="text-medium-emphasis mb-6">La ruta solicitada no existe.</p>
        <v-btn color="primary" :to="{ name: 'home' }">Volver al inicio</v-btn>
      </div>
    </v-main>
  </v-app>
</template>
