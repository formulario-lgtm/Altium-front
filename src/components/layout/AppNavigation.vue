<script setup lang="ts">
import type { NavItem } from '@/app/navigation';

defineProps<{ items: readonly NavItem[] }>();
</script>

<template>
  <nav aria-label="Navegación principal" class="altium-nav">
    <v-list density="comfortable" nav class="pa-3">
      <v-list-item
        v-for="item in items"
        :key="item.routeName"
        :to="{ name: item.routeName }"
        :prepend-icon="item.icon"
        :title="item.title"
        :exact="item.routeName === 'home'"
        rounded="lg"
        class="mb-1"
      />
    </v-list>
  </nav>
</template>
