<script setup lang="ts">
import { computed } from 'vue';
import type { SellerHome } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import HomeAlertList from './HomeAlertList.vue';
import HomeSaleList from './HomeSaleList.vue';
import { alertRoute, sellerOperationalAlerts } from '../utils/home-navigation';

const props = defineProps<{ home: SellerHome }>();
const auth = useAuthStore();
const drafts = computed(() => props.home.kpis.find((kpi) => kpi.code === 'DRAFTS')?.value ?? 0);
const returned = computed(() => props.home.returnedNeedingCorrection.length > 0);
// The correction queue already explains these alerts and links to the affected sales.
const alerts = computed(() =>
  sellerOperationalAlerts(props.home.alerts).filter(
    (alert) => !returned.value || !['CORRECTIONS_REQUIRED', 'RETURNED_STOCK'].includes(alert.code),
  ),
);
</script>

<template>
  <v-card tag="section" aria-labelledby="seller-work-title" data-testid="seller-work-queue">
    <v-card-text>
      <div class="d-flex flex-wrap align-center ga-3">
        <v-avatar
          :color="returned || alerts.length ? 'warning' : 'success'"
          variant="tonal"
          rounded="lg"
        >
          <v-icon :icon="returned || alerts.length ? 'mdi-clipboard-alert-outline' : 'mdi-check'" />
        </v-avatar>
        <div class="flex-grow-1" style="flex-basis: 12rem; min-width: 0">
          <h2 id="seller-work-title" class="text-subtitle-1 font-weight-bold">
            {{
              returned || alerts.length
                ? 'Requiere tu atención'
                : 'Todo al día con tus correcciones'
            }}
          </h2>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{
              returned
                ? 'Revisá las observaciones y corregí estas ventas para volver a presentarlas.'
                : alerts.length
                  ? 'Consultá los avisos pendientes para saber cómo seguir.'
                  : 'No tenés ventas devueltas por corregir.'
            }}
          </p>
        </div>
        <v-btn
          v-if="drafts > 0 && auth.hasPermission('sales.read')"
          :to="{ name: 'sales', query: { status: 'DRAFT' } }"
          variant="tonal"
          color="primary"
          append-icon="mdi-arrow-right"
          >{{ drafts === 1 ? 'Continuar 1 borrador' : `Continuar ${drafts} borradores` }}</v-btn
        >
      </div>
      <HomeSaleList
        v-if="returned"
        :sales="home.returnedNeedingCorrection"
        show-action
        class="mt-4"
      />
      <HomeAlertList
        v-if="alerts.length"
        :alerts="alerts"
        :resolve-route="(a) => alertRoute(a, 'seller')"
        class="mt-3"
      />
    </v-card-text>
  </v-card>
</template>
