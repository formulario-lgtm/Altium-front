<script setup lang="ts">
import { ref, watch } from 'vue';
import SaleDetailFields from './SaleDetailFields.vue';
const props = defineProps<{ cardNumber?: string | null; cvv?: string | null }>();
const visible = ref(false);
watch(
  () => [props.cardNumber, props.cvv],
  () => {
    visible.value = false;
  },
);
</script>

<template>
  <div v-if="cardNumber || cvv" class="mt-4">
    <v-btn
      variant="text"
      color="primary"
      :prepend-icon="visible ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
      :aria-expanded="visible"
      @click="visible = !visible"
      >{{ visible ? 'Ocultar datos de tarjeta' : 'Mostrar datos de tarjeta' }}</v-btn
    >
    <SaleDetailFields
      class="mt-3"
      :fields="[
        {
          label: 'Número de tarjeta',
          value: visible ? cardNumber : cardNumber ? `•••• ${cardNumber.slice(-4)}` : null,
        },
        { label: 'CVV / CVC', value: cvv ? (visible ? cvv : '••••') : null },
      ]"
    />
  </div>
</template>
