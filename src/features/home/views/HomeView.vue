<script setup lang="ts">
import { computed } from 'vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { useNavigationItems } from '@/composables/useNavigationItems';
import { useAuthStore } from '@/stores/auth.store';

const auth = useAuthStore();
const { items } = useNavigationItems();

const quickLinks = computed(() => items.value.filter((item) => item.routeName !== 'home'));
const greeting = computed(() => `Hola, ${auth.user?.firstName ?? ''}`.trim());
</script>

<template>
  <div>
    <PageHeader :title="greeting" subtitle="Bienvenido a Altium CRM." />

    <v-card class="mb-6">
      <v-card-text class="d-flex flex-wrap align-center ga-4">
        <v-avatar color="primary" variant="tonal" size="44">
          <v-icon icon="mdi-account-outline" />
        </v-avatar>
        <div class="flex-grow-1">
          <p class="text-subtitle-1 font-weight-medium mb-0">{{ auth.displayName }}</p>
          <p class="text-body-2 text-medium-emphasis mb-0">{{ auth.user?.email }}</p>
        </div>
        <v-chip variant="outlined" label data-testid="home-role">
          {{ auth.roleCode }}
        </v-chip>
      </v-card-text>
    </v-card>

    <h2 class="text-subtitle-1 font-weight-bold mb-3">Accesos rápidos</h2>
    <v-row v-if="quickLinks.length > 0" dense>
      <v-col v-for="link in quickLinks" :key="link.routeName" cols="12" sm="6" lg="3">
        <v-card :to="{ name: link.routeName }" class="h-100">
          <v-card-item :prepend-icon="link.icon" :title="link.title" />
          <v-card-text v-if="link.description" class="text-body-2 text-medium-emphasis pt-0">
            {{ link.description }}
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <p v-else class="text-body-2 text-medium-emphasis">
      Tu rol todavía no tiene módulos administrativos asignados. Los módulos comerciales llegarán en
      próximas versiones.
    </p>

    <div class="mt-6 d-flex flex-wrap ga-2">
      <v-btn variant="text" prepend-icon="mdi-devices" :to="{ name: 'account-sessions' }">
        Mis sesiones
      </v-btn>
      <v-btn variant="text" prepend-icon="mdi-heart-pulse" :to="{ name: 'system-status' }">
        Estado del sistema
      </v-btn>
    </div>
  </div>
</template>
