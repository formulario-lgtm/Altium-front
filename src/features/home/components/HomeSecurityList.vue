<script setup lang="ts">
import { computed } from 'vue';
import type { AdminHome } from '@/services/http';
import EmptyState from '@/components/common/EmptyState.vue';
import StatusBadge from '@/components/common/StatusBadge.vue';
import { useAuthStore } from '@/stores/auth.store';
import { auditActionLabel } from '@/utils/audit-labels';
import { entityTypeLabel } from '@/utils/entity-labels';
import { formatDateTime } from '@/utils/format';
import { recentHomeActivity } from '../utils/recent-activity';

const props = defineProps<{ events: AdminHome['recentSecurityEvents'] }>();
const recentEvents = computed(() => recentHomeActivity(props.events, (event) => event.occurredAt));
const auth = useAuthStore();
</script>

<template>
  <EmptyState
    v-if="events.length === 0"
    title="Sin eventos recientes"
    text="Acá vas a ver los últimos movimientos de seguridad y administración."
    icon="mdi-shield-check-outline"
    compact
  />
  <v-list v-else class="bg-transparent pa-0" lines="two" data-testid="home-security-events">
    <v-list-item
      v-for="event in recentEvents"
      :key="event.id"
      :value="event.id"
      :to="auth.hasPermission('audit.read') ? { name: 'audit' } : undefined"
    >
      <v-list-item-title class="text-wrap font-weight-medium">{{
        auditActionLabel(event.action)
      }}</v-list-item-title>
      <v-list-item-subtitle class="text-wrap"
        >{{ entityTypeLabel(event.entityType) }} ·
        {{ formatDateTime(event.occurredAt) }}</v-list-item-subtitle
      >
      <template #append
        ><StatusBadge :status="event.outcome" class="ml-2" /><v-icon
          v-if="auth.hasPermission('audit.read')"
          icon="mdi-chevron-right"
          size="18"
          class="text-medium-emphasis ml-2"
      /></template>
    </v-list-item>
  </v-list>
</template>
