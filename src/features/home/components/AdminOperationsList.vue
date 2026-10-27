<script setup lang="ts">
import { MONTHLY_GOALS_ENABLED } from '@/config/features';
import { computed } from 'vue';
import { useRouter, type RouteLocationRaw } from 'vue-router';
import type { AdminHome, HomePeriodTeamQuery } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import { accessibleHomeRoute, withHomePeriod } from '../utils/home-navigation';

const props = defineProps<{ home: AdminHome; period: HomePeriodTeamQuery }>();
const auth = useAuthStore();
const router = useRouter();
const rows = computed(() => [
  {
    key: 'follow-ups',
    title: 'Seguimientos vencidos',
    value: props.home.followUpsOverdue,
    description: 'Consultar las gestiones pendientes.',
    icon: 'mdi-calendar-alert',
    color: 'warning',
    to: { name: 'admin-follow-ups' },
  },
  {
    key: 'submitted',
    title: 'Presentadas demoradas',
    value: props.home.staleSubmitted,
    description: 'Abrir la cola de ventas presentadas.',
    icon: 'mdi-clipboard-clock-outline',
    color: 'warning',
    to: { name: 'admin-sales', query: { status: 'SUBMITTED' } },
  },
  {
    key: 'goals',
    title: 'Equipos sin objetivo',
    value: props.home.teamsWithoutGoal,
    description: 'Consultar los objetivos del período.',
    icon: 'mdi-target',
    color: 'warning',
    to: withHomePeriod({ name: 'supervision-goals' }, props.period),
  },
  {
    key: 'activation',
    title: 'Pendientes de activación',
    value: props.home.usersPendingActivation,
    description: 'Consultar las cuentas de usuario.',
    icon: 'mdi-account-clock-outline',
    color: 'info',
    to: { name: 'users' },
  },
  {
    key: 'suspended',
    title: 'Cuentas suspendidas',
    value: props.home.usersSuspended,
    description: 'Consultar el estado de las cuentas.',
    icon: 'mdi-account-lock-outline',
    color: 'secondary',
    to: { name: 'users' },
  },
]);
const visibleRows = computed(() =>
  rows.value.filter((item) => MONTHLY_GOALS_ENABLED || item.key !== 'goals'),
);
function destination(to: RouteLocationRaw | null) {
  return accessibleHomeRoute(router, to, auth.hasPermission) ?? undefined;
}
</script>

<template>
  <v-list class="bg-transparent pa-0" lines="two" data-testid="admin-operations">
    <v-list-item
      v-for="row in visibleRows"
      :key="row.key"
      :value="row.key"
      :to="destination(row.to)"
    >
      <template #prepend
        ><v-icon
          :icon="row.icon"
          :color="row.value > 0 ? row.color : 'secondary'"
          size="22"
          class="mr-3"
      /></template>
      <v-list-item-title class="text-wrap font-weight-medium">{{ row.title }}</v-list-item-title>
      <v-list-item-subtitle class="text-wrap">{{ row.description }}</v-list-item-subtitle>
      <template #append
        ><v-chip
          variant="tonal"
          :color="row.value > 0 ? row.color : 'secondary'"
          :aria-label="`${row.title}: ${row.value}`"
          >{{ row.value }}</v-chip
        ><v-icon
          v-if="destination(row.to)"
          icon="mdi-chevron-right"
          size="18"
          class="text-medium-emphasis ml-2"
      /></template>
    </v-list-item>
  </v-list>
</template>
