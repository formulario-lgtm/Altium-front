<script setup lang="ts">
import { ref } from 'vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import AppNavigation from '@/components/layout/AppNavigation.vue';
import { useNavigationItems } from '@/composables/useNavigationItems';
import { useLogoutMutation } from '@/features/auth/composables/useAuthMutations';
import { useAuthStore } from '@/stores/auth.store';

const auth = useAuthStore();
const { items } = useNavigationItems();
const logoutMutation = useLogoutMutation();

/** Closed by default; open via header hamburger on any breakpoint. */
const drawer = ref(false);

function logout(): void {
  logoutMutation.mutate();
}
</script>

<template>
  <div class="altium-shell">
    <div class="altium-shell__atmosphere" aria-hidden="true">
      <span class="altium-shell__glow altium-shell__glow--tl" />
      <span class="altium-shell__glow altium-shell__glow--br" />
      <span class="altium-shell__dots" />
    </div>

    <AppHeader
      :user-name="auth.displayName"
      :username="auth.user?.username"
      :role-code="auth.roleCode"
      :show-nav-toggle="!auth.mustChangePassword"
      :logging-out="logoutMutation.isPending.value"
      @toggle-nav="drawer = !drawer"
      @logout="logout"
    />

    <v-navigation-drawer v-if="!auth.mustChangePassword" v-model="drawer" temporary width="248">
      <AppNavigation :items="items" />
    </v-navigation-drawer>

    <v-main>
      <v-container class="py-6 py-md-8 altium-page" fluid>
        <router-view />
      </v-container>
    </v-main>
  </div>
</template>
