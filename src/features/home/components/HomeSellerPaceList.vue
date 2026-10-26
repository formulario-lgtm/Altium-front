<script setup lang="ts">
import type { HomeSellerPace, HomePeriodTeamQuery } from '@/services/http';
import EmptyState from '@/components/common/EmptyState.vue';
import UserAvatar from '@/components/common/UserAvatar.vue';
import { fullName, initialsFromPerson } from '@/utils/format';
import { formatHomeCompliance } from '../utils/home-labels';
import { withHomePeriod, accessibleHomeRoute } from '../utils/home-navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'vue-router';

defineProps<{ sellers: readonly HomeSellerPace[]; period: HomePeriodTeamQuery }>();
const auth = useAuthStore();
const router = useRouter();
</script>

<template>
  <EmptyState
    v-if="sellers.length === 0"
    icon="mdi-account-check-outline"
    title="Sin vendedores bajo ritmo"
    text="No se detectaron vendedores con objetivo por debajo del avance esperado."
    compact
  />
  <v-list v-else class="bg-transparent pa-0" lines="two" data-testid="home-seller-pace-list">
    <v-list-item
      v-for="seller in sellers"
      :key="seller.sellerId"
      :value="seller.sellerId"
      :to="
        accessibleHomeRoute(
          router,
          withHomePeriod(
            { name: 'supervision-seller-detail', params: { id: seller.sellerId } },
            period,
          ),
          auth.hasPermission,
        ) ?? undefined
      "
    >
      <template #prepend
        ><UserAvatar :initials="initialsFromPerson(seller)" :size="36" class="mr-3"
      /></template>
      <v-list-item-title class="text-wrap font-weight-medium">{{
        fullName(seller)
      }}</v-list-item-title>
      <v-list-item-subtitle class="text-wrap"
        >{{ seller.salesPresented }} ventas presentadas</v-list-item-subtitle
      >
      <template #append
        ><div class="text-end ml-2">
          <span class="font-weight-bold">{{ formatHomeCompliance(seller.compliance) }}</span
          ><span class="d-block text-caption text-primary"
            >Ver avance <v-icon icon="mdi-chevron-right" size="16"
          /></span></div
      ></template>
    </v-list-item>
  </v-list>
</template>
