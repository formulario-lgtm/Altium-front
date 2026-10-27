<script setup lang="ts">
import { computed } from 'vue';
import ErrorState from '@/components/common/ErrorState.vue';
import { useRoleHomeView } from '../composables/useRoleHomeView';
import PageHeader from '@/components/common/PageHeader.vue';
import { useNavigationItems } from '@/composables/useNavigationItems';
import { useAuthStore } from '@/stores/auth.store';
import HomeQuickActions from '../components/HomeQuickActions.vue';
import { resolveHomeVariant } from '../utils/home-labels';
import type { HomeQuickAction } from '../utils/home-navigation';

const auth = useAuthStore();
const { items } = useNavigationItems();

const variant = computed(() =>
  resolveHomeVariant((code) => auth.hasPermission(code), auth.roleCode),
);
const { view, failed, retry } = useRoleHomeView(variant);

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
  <ErrorState v-if="failed" message="No se pudo cargar la pantalla de inicio." @retry="retry" />
  <component :is="view" v-else-if="view" />
  <div v-else-if="variant === 'fallback'" data-testid="fallback-home">
    <PageHeader :title="greeting" subtitle="Bienvenido a Altium.">
      <template #actions>
        <HomeQuickActions inline :actions="fallbackActions" />
      </template>
    </PageHeader>
  </div>
</template>
