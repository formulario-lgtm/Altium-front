<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import type { HomeQuickAction } from '../utils/home-navigation';

const props = withDefaults(
  defineProps<{
    actions: readonly HomeQuickAction[];
    /** Compact row for PageHeader actions (next to the greeting). */
    inline?: boolean;
  }>(),
  { inline: false },
);

const auth = useAuthStore();

const visible = computed(() =>
  props.actions.filter((action) => !action.permission || auth.hasPermission(action.permission)),
);
</script>

<template>
  <div
    v-if="visible.length > 0"
    class="home-quick-actions"
    :class="{ 'home-quick-actions--inline': inline }"
    data-testid="home-quick-actions"
  >
    <v-card
      v-for="action in visible"
      :key="action.key"
      :to="action.to"
      class="home-quick-actions__card"
      :class="{ 'home-quick-actions__card--inline': inline }"
    >
      <v-card-item :prepend-icon="action.icon" :title="action.title" :subtitle="action.description" />
    </v-card>
  </div>
  <p v-else-if="!inline" class="text-body-2 text-medium-emphasis mb-0">
    No hay accesos rápidos disponibles para tu rol.
  </p>
</template>

<style scoped lang="scss">
.home-quick-actions {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr));
  width: 100%;

  &--inline {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    align-items: stretch;
    gap: 0.75rem;
    width: auto;
    max-width: 100%;
  }
}

.home-quick-actions__card {
  height: 100%;

  &--inline {
    flex: 0 1 auto;
    min-width: 10.5rem;
    max-width: 14rem;
  }
}
</style>
