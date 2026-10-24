<script setup lang="ts">
import ThemeToggleButton from '@/components/layout/ThemeToggleButton.vue';
import { useThemeSync } from '@/composables/useThemeSync';
import { appEnv } from '@/config/env';

useThemeSync();
</script>

<template>
  <v-app>
    <v-app-bar flat border color="surface" density="comfortable">
      <v-app-bar-title class="text-primary font-weight-bold">
        {{ appEnv.appTitle }}
      </v-app-bar-title>
      <v-spacer />
      <ThemeToggleButton />
    </v-app-bar>

    <v-main>
      <v-container class="py-8" fluid>
        <router-view />
      </v-container>
    </v-main>

    <v-footer app class="justify-center text-medium-emphasis text-caption py-3">
      Bootstrap stage · Vue 3 + Vuetify
    </v-footer>
  </v-app>
</template>
