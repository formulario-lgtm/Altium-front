<script setup lang="ts">
import type { NavItem } from '@/app/navigation';

defineProps<{ items: readonly NavItem[] }>();
</script>

<template>
  <nav aria-label="Navegación principal">
    <v-list density="comfortable" nav color="primary" class="pa-2">
      <v-list-item
        v-for="item in items"
        :key="item.routeName"
        :to="{ name: item.routeName }"
        :prepend-icon="item.icon"
        :title="item.title"
        :exact="item.routeName === 'home'"
        rounded="md"
      />
    </v-list>
  </nav>
</template>
