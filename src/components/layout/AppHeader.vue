<script setup lang="ts">
import ThemeToggleButton from './ThemeToggleButton.vue';

withDefaults(
  defineProps<{
    userName?: string;
    roleCode?: string | null;
    showNavToggle?: boolean;
    loggingOut?: boolean;
  }>(),
  { userName: '', roleCode: null, showNavToggle: true, loggingOut: false },
);

const emit = defineEmits<{ 'toggle-nav': []; logout: [] }>();
</script>

<template>
  <v-app-bar flat border color="surface" density="comfortable">
    <v-app-bar-nav-icon
      v-if="showNavToggle"
      aria-label="Abrir o cerrar navegación"
      @click="emit('toggle-nav')"
    />
    <v-app-bar-title>
      <router-link :to="{ name: 'home' }" class="altium-brand text-decoration-none text-primary">
        Altium
      </router-link>
    </v-app-bar-title>

    <template #append>
      <ThemeToggleButton />
      <v-menu v-if="userName" location="bottom end">
        <template #activator="{ props: menuProps }">
          <v-btn
            v-bind="menuProps"
            variant="text"
            class="text-none ml-1"
            prepend-icon="mdi-account-circle-outline"
            append-icon="mdi-chevron-down"
            aria-label="Menú de usuario"
            data-testid="user-menu"
          >
            <span class="d-none d-sm-inline">{{ userName }}</span>
          </v-btn>
        </template>
        <v-list density="compact" min-width="240">
          <v-list-item :title="userName" :subtitle="roleCode ?? undefined" />
          <v-divider class="my-1" />
          <v-list-item
            :to="{ name: 'account-change-password' }"
            prepend-icon="mdi-key-outline"
            title="Cambiar contraseña"
          />
          <v-list-item
            :to="{ name: 'account-sessions' }"
            prepend-icon="mdi-devices"
            title="Sesiones activas"
          />
          <v-divider class="my-1" />
          <v-list-item
            prepend-icon="mdi-logout"
            title="Cerrar sesión"
            :disabled="loggingOut"
            data-testid="logout"
            @click="emit('logout')"
          />
        </v-list>
      </v-menu>
    </template>
  </v-app-bar>
</template>
