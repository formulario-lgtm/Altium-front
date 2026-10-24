<script setup lang="ts">
import { computed } from 'vue';
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
  if (!enabled.value) return 'Health check disabled';
  if (query.isPending.value) return 'Checking API…';
  if (query.isError.value) return 'API unavailable';
  return `API ${query.data.value?.status ?? 'ok'}`;
});

function retryHealth(): void {
  void query.refetch();
}
</script>

<template>
  <div class="mx-auto" style="max-width: 720px">
    <header class="mb-6">
      <h1 class="text-h4 font-weight-bold mb-2">System status</h1>
      <p class="text-body-1 text-medium-emphasis mb-0">
        Minimal bootstrap screen to verify Vue, Vuetify, routing, and theming. CRM modules are not
        implemented yet.
      </p>
    </header>

    <v-row dense>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Runtime</v-card-title>
          <v-card-text>
            <v-list density="compact" class="bg-transparent pa-0">
              <v-list-item title="Framework" subtitle="Vue 3 + Vite + Vuetify 3" />
              <v-list-item title="State" subtitle="Pinia (UI) · TanStack Query (remote)" />
              <v-list-item title="HTTP" :subtitle="appEnv.apiBaseUrl" />
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>API probe</v-card-title>
          <v-card-text>
            <v-chip class="mb-3" :color="healthChipColor" variant="tonal" label>
              {{ healthLabel }}
            </v-chip>
            <p v-if="!enabled" class="text-body-2 text-medium-emphasis mb-0">
              Set <code>VITE_ENABLE_HEALTH_CHECK=true</code> to call <code>GET /health</code>. The
              UI runs without the backend.
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
              Retry
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>
