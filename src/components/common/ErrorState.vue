<script setup lang="ts">
withDefaults(
  defineProps<{
    message: string;
    title?: string;
    requestId?: string | null;
    retryable?: boolean;
    loading?: boolean;
  }>(),
  { title: 'No se pudo cargar la información', requestId: null, retryable: true, loading: false },
);

const emit = defineEmits<{ retry: [] }>();
</script>

<template>
  <v-alert type="error" :title="title" class="my-4" role="alert">
    <p class="mb-0">{{ message }}</p>
    <p v-if="requestId" class="text-caption mt-1 mb-0">Referencia: {{ requestId }}</p>
    <template v-if="retryable" #append>
      <v-btn variant="outlined" size="small" :loading="loading" @click="emit('retry')">
        Reintentar
      </v-btn>
    </template>
  </v-alert>
</template>
