<script setup lang="ts">
import { useRouter } from 'vue-router';
import EmptyState from '@/components/common/EmptyState.vue';
import type { HomeFollowUpRef } from '@/services/http';
import { formatDateTime, formatSaleNumber } from '@/utils/format';

defineProps<{
  items: readonly HomeFollowUpRef[];
  emptyTitle?: string;
  emptyText?: string;
}>();

const router = useRouter();

function open(item: HomeFollowUpRef): void {
  void router.push({
    name: 'admin-sale-review',
    params: { id: item.saleId },
    query: { section: 'followUps' },
  });
}
</script>

<template>
  <EmptyState
    v-if="items.length === 0"
    :title="emptyTitle ?? 'Sin seguimientos próximos'"
    :text="emptyText ?? 'No hay seguimientos programados en tu alcance.'"
    icon="mdi-calendar-check-outline"
    compact
  />
  <v-list v-else lines="two" class="bg-transparent pa-0" data-testid="home-follow-up-list">
    <v-list-item
      v-for="item in items"
      :key="item.id"
      class="home-follow-up-list__item"
      role="link"
      tabindex="0"
      @click="open(item)"
      @keydown.enter="open(item)"
    >
      <v-list-item-title>{{ formatSaleNumber(item.saleNumber) }}</v-list-item-title>
      <v-list-item-subtitle>
        {{ item.description }}
        <span v-if="item.nextFollowUpAt"> · {{ formatDateTime(item.nextFollowUpAt) }}</span>
      </v-list-item-subtitle>
    </v-list-item>
  </v-list>
</template>

<style scoped lang="scss">
.home-follow-up-list__item {
  cursor: pointer;
  border-radius: 8px;

  &:hover {
    background: rgba(var(--v-theme-primary), 0.06);
  }
}
</style>
