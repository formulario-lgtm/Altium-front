<script setup lang="ts">
import { computed } from 'vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { useNavigationItems } from '@/composables/useNavigationItems';
import { useAuthStore } from '@/stores/auth.store';
import HomeQuickActions from '../components/HomeQuickActions.vue';
import { resolveHomeVariant } from '../utils/home-labels';
import type { HomeQuickAction } from '../utils/home-navigation';
import AdministrativeHomeView from './AdministrativeHomeView.vue';
import AdminHomeView from './AdminHomeView.vue';
import SellerHomeView from './SellerHomeView.vue';
import SupervisorHomeView from './SupervisorHomeView.vue';

const auth = useAuthStore();
const { items } = useNavigationItems();

const variant = computed(() => resolveHomeVariant((code) => auth.hasPermission(code)));

const greeting = computed(() => `Hola, ${auth.user?.firstName ?? ''}`.trim());

const fallbackActions = computed<HomeQuickAction[]>(() =>
  items.value
    .filter((item) => item.routeName !== 'home')
    .map((item) => ({
      key: item.routeName,
      title: item.title,
      description: item.description,
      icon: item.icon,
      to: { name: item.routeName },
    })),
);
</script>

<template>
  <AdminHomeView v-if="variant === 'admin'" />
  <AdministrativeHomeView v-else-if="variant === 'administrative'" />
  <SupervisorHomeView v-else-if="variant === 'supervisor'" />
  <SellerHomeView v-else-if="variant === 'seller'" />
  <div v-else data-testid="fallback-home">
    <PageHeader :title="greeting" subtitle="Bienvenido a Altium.">
      <template #actions>
        <HomeQuickActions inline :actions="fallbackActions" />
      </template>
    </PageHeader>
  </div>
</template>
