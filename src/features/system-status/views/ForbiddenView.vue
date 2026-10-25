<script setup lang="ts">
import EmptyState from '@/components/common/EmptyState.vue';
</script>

<template>
  <EmptyState
    icon="mdi-shield-lock-outline"
    title="Acceso denegado"
    title-tag="h1"
    text="Tu rol no tiene permiso para ver esta sección."
  >
    <template #actions>
      <v-btn color="primary" :to="{ name: 'home' }">Ir al inicio</v-btn>
    </template>
  </EmptyState>
</template>
