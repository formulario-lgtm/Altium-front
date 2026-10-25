<script setup lang="ts">
import { ref, watch } from 'vue';
import { useDisplay } from 'vuetify';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppNavigation from '@/components/layout/AppNavigation.vue';
import { useNavigationItems } from '@/composables/useNavigationItems';
import { useThemeSync } from '@/composables/useThemeSync';
import { useLogoutMutation } from '@/features/auth/composables/useAuthMutations';
import { useAuthStore } from '@/stores/auth.store';

useThemeSync();

const auth = useAuthStore();
const { mdAndUp } = useDisplay();
const { items } = useNavigationItems();
const logoutMutation = useLogoutMutation();

const drawer = ref(mdAndUp.value);
watch(mdAndUp, (desktop) => {
  drawer.value = desktop;
});

function logout(): void {
  logoutMutation.mutate();
}
</script>

<template>
  <v-app>
    <AppHeader
      :user-name="auth.displayName"
      :role-code="auth.roleCode"
      :show-nav-toggle="!auth.mustChangePassword"
      :logging-out="logoutMutation.isPending.value"
      @toggle-nav="drawer = !drawer"
      @logout="logout"
    />

    <v-navigation-drawer
      v-if="!auth.mustChangePassword"
      v-model="drawer"
      :permanent="mdAndUp"
      :temporary="!mdAndUp"
      width="248"
      border
      elevation="0"
    >
      <AppNavigation :items="items" />
    </v-navigation-drawer>

    <v-main>
      <v-container class="py-6 py-md-8 altium-page" fluid>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>
