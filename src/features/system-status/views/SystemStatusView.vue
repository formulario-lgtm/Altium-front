<script setup lang="ts">
import { computed } from 'vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { appEnv } from '@/config/env';
import { useApiHealthQuery } from '@/features/system-status/composables/useApiHealthQuery';

const { enabled, query, errorMessage } = useApiHealthQuery();

const isHealthFetching = computed(() => query.isFetching.value);

const healthChipColor = computed(() => {
  if (!enabled.value) return 'secondary';
  if (query.isPending.value) return 'info';
  if (query.isError.value) return 'error';
  return 'success';
});

const healthLabel = computed(() => {
  if (!enabled.value) return 'Sonda deshabilitada';
  if (query.isPending.value) return 'Verificando API…';
  if (query.isError.value) return 'API no disponible';
  return `API ${query.data.value?.status ?? 'ok'}`;
});

function retryHealth(): void {
  void query.refetch();
}
</script>

<template>
  <div style="max-width: 720px">
    <PageHeader
      title="Estado del sistema"
      subtitle="Información técnica del frontend y sonda opcional de la API."
    />

    <v-row dense>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Runtime</v-card-title>
          <v-card-text>
            <v-list density="compact" class="bg-transparent pa-0">
              <v-list-item title="Framework" subtitle="Vue 3 + Vite + Vuetify 3" />
              <v-list-item title="Estado" subtitle="Pinia (UI/sesión) · TanStack Query (remoto)" />
              <v-list-item title="API" :subtitle="appEnv.apiBaseUrl" />
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Sonda de API</v-card-title>
          <v-card-text>
            <v-chip class="mb-3" :color="healthChipColor" variant="tonal" label>
              {{ healthLabel }}
            </v-chip>
            <p v-if="!enabled" class="text-body-2 text-medium-emphasis mb-0">
              Define <code>VITE_ENABLE_HEALTH_CHECK=true</code> para consultar
              <code>GET /health</code>.
            </p>
            <p v-else-if="errorMessage" class="text-body-2 text-error mb-3" role="alert">
              {{ errorMessage }}
            </p>
            <v-btn
              v-if="enabled"
              :loading="isHealthFetching"
              variant="outlined"
              prepend-icon="mdi-refresh"
              @click="retryHealth"
            >
              Reintentar
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
