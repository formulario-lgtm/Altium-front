<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';
defineProps<{
  items: {
    id: string;
    name: string;
    to?: RouteLocationRaw;
    primary: string;
    value: number;
    metrics: { label: string; value: number }[];
  }[];
}>();
</script>
<template>
  <dl class="d-flex flex-column ga-4 mb-0">
    <div v-for="item in items" :key="item.id">
      <dt class="d-flex flex-wrap align-center justify-space-between ga-2">
        <router-link v-if="item.to" :to="item.to">{{ item.name }}</router-link
        ><span v-else>{{ item.name }}</span>
        <span class="text-body-2 font-weight-bold">{{ item.value }} {{ item.primary }}</span>
      </dt>
      <dd class="d-flex flex-wrap ga-2 mt-2 ms-0 text-caption text-medium-emphasis">
        <span v-for="metric in item.metrics" :key="metric.label"
          ><strong>{{ metric.value }}</strong> {{ metric.label }}</span
        >
      </dd>
    </div>
  </dl>
</template>
