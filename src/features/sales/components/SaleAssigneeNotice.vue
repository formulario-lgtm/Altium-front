<script setup lang="ts">
import { computed } from 'vue';
import type { Sale } from '@/services/http';

const props = defineProps<{ assignee: Sale['administrativeAssignee'] }>();
const name = computed(() =>
  props.assignee
    ? `${props.assignee.firstName} ${props.assignee.lastName}`.trim()
    : 'Sin administrativo asignado',
);
</script>

<template>
  <div class="d-flex align-center flex-wrap ga-2 mb-4 text-body-2" data-testid="sale-assignee">
    <v-icon icon="mdi-account-tie-outline" size="20" color="primary" aria-hidden="true" />
    <span class="text-medium-emphasis">Administrativo responsable:</span>
    <strong class="text-break">{{ name }}</strong>
  </div>
</template>
