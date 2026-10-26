<script setup lang="ts">
import { computed } from 'vue';
import ErrorState from '@/components/common/ErrorState.vue';
import PageHeader from '@/components/common/PageHeader.vue';
import { apiErrorMessage, isApiError } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import HomeKpiGrid from '../components/HomeKpiGrid.vue';
import HomeSaleList from '../components/HomeSaleList.vue';
import SellerWorkQueue from '../components/SellerWorkQueue.vue';
import SellerProgressCard from '../components/SellerProgressCard.vue';
import { useSellerHomeQuery } from '../composables/useHome';
import { useHomePeriod } from '../composables/useHomePeriod';
import { periodLabel } from '../utils/home-labels';
import { sellerKpiRoute } from '../utils/home-navigation';
import { recentHomeActivity } from '../utils/recent-activity';

const auth = useAuthStore();
const { year, month, periodQuery } = useHomePeriod({ allowPastMonths: false, syncRoute: false });
const homeQuery = useSellerHomeQuery(periodQuery);
const greeting = computed(() => `Hola, ${auth.user?.firstName ?? ''}`.trim());
const periodText = computed(() => periodLabel(year.value, month.value));
const recentSales = computed(() =>
  recentHomeActivity(homeQuery.data.value?.recentSales ?? [], (sale) => sale.updatedAt),
);
const holderNames = computed(() =>
  Object.fromEntries(
    recentSales.value.map((sale) => [
      sale.id,
      [sale.holderFirstName?.trim(), sale.holderLastName?.trim()].filter(Boolean).join(' '),
    ]),
  ),
);
</script>

<template>
  <div data-testid="seller-home">
    <PageHeader :title="greeting" :subtitle="`Tu espacio de ventas · ${periodText}`">
      <template #actions>
        <div class="d-flex flex-wrap ga-2" data-testid="home-quick-actions">
          <v-btn
            v-if="auth.hasPermission('sales.read')"
            :to="{ name: 'sales' }"
            variant="outlined"
            prepend-icon="mdi-clipboard-text-outline"
            >Mis ventas</v-btn
          >
          <v-btn
            v-if="auth.hasPermission('sales.create')"
            :to="{ name: 'sale-new' }"
            color="primary"
            prepend-icon="mdi-plus"
            >Nueva venta</v-btn
          >
        </div>
      </template>
    </PageHeader>
    <ErrorState
      v-if="homeQuery.error.value"
      :message="apiErrorMessage(homeQuery.error.value)"
      :request-id="isApiError(homeQuery.error.value) ? homeQuery.error.value.requestId : null"
      :loading="homeQuery.isFetching.value"
      @retry="homeQuery.refetch()"
    />
    <template v-else-if="homeQuery.data.value">
      <HomeKpiGrid
        :kpis="homeQuery.data.value.kpis"
        :resolve-route="sellerKpiRoute"
        compact-mobile
      />
      <SellerWorkQueue :home="homeQuery.data.value" class="mb-6 mt-3" />
      <v-row>
        <v-col cols="12" lg="7" class="d-flex">
          <v-card
            tag="section"
            aria-labelledby="seller-activity-title"
            class="flex-grow-1"
            data-testid="seller-activity"
          >
            <div class="d-flex flex-wrap align-center justify-space-between ga-2 pa-5 pb-2">
              <div>
                <h2 id="seller-activity-title" class="text-h6">Actividad reciente</h2>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  Retomá una venta o consultá su estado.
                </p>
              </div>
              <v-btn
                v-if="auth.hasPermission('sales.read')"
                :to="{ name: 'sales' }"
                variant="text"
                color="primary"
                append-icon="mdi-arrow-right"
                size="small"
                >Ver todas</v-btn
              >
            </div>
            <v-card-text class="pt-2">
              <HomeSaleList
                :sales="recentSales"
                :holder-names="holderNames"
                show-action
                empty-title="Tu primera venta empieza acá"
                empty-text="Creá una venta y guardá tu avance como borrador."
              />
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" lg="5" class="d-flex">
          <SellerProgressCard
            :home="homeQuery.data.value"
            :period="periodText"
            class="flex-grow-1"
          />
        </v-col>
      </v-row>
    </template>
    <v-skeleton-loader v-else-if="homeQuery.isLoading.value" type="article, article" />
  </div>
</template>
