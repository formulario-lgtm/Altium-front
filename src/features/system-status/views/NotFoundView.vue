<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <v-app>
    <v-main class="d-flex align-center justify-center">
      <div class="text-center pa-6">
        <h1 class="text-h4 mb-2">Page not found</h1>
        <p class="text-medium-emphasis mb-6">The requested route does not exist.</p>
        <v-btn color="primary" @click="router.push({ name: 'system-status' })">
          Back to system status
        </v-btn>
      </div>
    </v-main>
  </v-app>
</template>
