<script setup lang="ts">
import { ref } from 'vue';
import type { SaleFormModel } from '../utils/sale-form-model';
import { fieldErrorProps } from '../utils/sale-field-errors';
import { PAYMENT_METHOD_OPTIONS } from '../utils/sale-labels';
const showCardNumber = ref(false);
const showCvv = ref(false);
const model = defineModel<SaleFormModel['billing']>({ required: true });
const props = defineProps<{ disabled?: boolean; fieldErrors: Readonly<Record<string, string>> }>();
const emit = defineEmits<{ 'clear-field-error': [string] }>();
function fieldProps(path: string) {
  return fieldErrorProps(props.fieldErrors, path);
}
function clearFieldError(path: string) {
  emit('clear-field-error', path);
}
</script>
<template>
  <div>
    <h2 class="text-h6 mb-2">Cobranza y facturación</h2>
    <v-alert type="info" variant="tonal" class="mb-4" density="compact">
      Indicá quién paga y elegí la forma de pago. Para tarjeta, completá los datos y adjuntá frente
      y dorso. Para débito, ingresá CBU, CVU o alias.
    </v-alert>
    <v-row dense>
      <v-col cols="12" md="4">
        <v-select
          :model-value="model.holderIsPayer === null ? null : model.holderIsPayer ? 'Si' : 'No'"
          :items="['Si', 'No']"
          label="¿El titular es el pagador? *"
          required
          clearable
          :disabled="disabled"
          v-bind="fieldProps('billing.holderIsPayer')"
          @update:model-value="
            clearFieldError('billing.holderIsPayer');
            model.holderIsPayer = $event === 'Si' ? true : $event === 'No' ? false : null;
          "
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-select
          v-model="model.paymentMethod"
          :items="PAYMENT_METHOD_OPTIONS"
          label="Forma de pago *"
          required
          clearable
          :disabled="disabled"
          v-bind="fieldProps('billing.paymentMethod')"
          @update:model-value="clearFieldError('billing.paymentMethod')"
        />
      </v-col>
    </v-row>

    <template v-if="model.holderIsPayer === true">
      <v-text-field
        v-if="model.paymentMethod === 'CBU'"
        key="billing-bank-reference"
        v-model="model.paymentMedium"
        name="sale-billing-bank-reference"
        autocomplete="off"
        class="mt-2"
        label="CBU/CVU/ALIAS *"
        required
        :disabled="disabled"
        v-bind="fieldProps('billing.paymentMedium')"
        @update:model-value="clearFieldError('billing.paymentMedium')"
      />
    </template>
    <v-row v-if="model.paymentMethod === 'CARD'" dense class="mt-2">
      <v-col cols="12" md="3">
        <v-text-field
          v-model="model.cardBrand"
          label="Marca de tarjeta *"
          required
          :disabled="disabled"
          v-bind="fieldProps('billing.cardBrand')"
          @update:model-value="clearFieldError('billing.cardBrand')"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          key="billing-card-number"
          :model-value="model.cardNumber"
          name="sale-billing-card-number"
          :class="{ 'sale-billing-secret--masked': !showCardNumber }"
          label="Número de tarjeta *"
          required
          type="text"
          :append-inner-icon="showCardNumber ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          autocomplete="section-sale-billing cc-number"
          inputmode="numeric"
          maxlength="19"
          :disabled="disabled"
          v-bind="fieldProps('billing.cardNumber')"
          @click:append-inner="showCardNumber = !showCardNumber"
          @update:model-value="
            model.cardNumber = String($event ?? '')
              .replace(/\D/g, '')
              .slice(0, 19);
            clearFieldError('billing.cardNumber');
          "
        />
      </v-col>
      <v-col cols="12" md="2">
        <v-text-field
          key="billing-card-security-code"
          :model-value="model.cvv"
          name="sale-billing-card-security-code"
          :class="{ 'sale-billing-secret--masked': !showCvv }"
          label="CVV / CVC *"
          required
          type="text"
          :append-inner-icon="showCvv ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          autocomplete="section-sale-billing cc-csc"
          inputmode="numeric"
          maxlength="4"
          hint="3 o 4 dígitos."
          persistent-hint
          :disabled="disabled"
          v-bind="fieldProps('billing.cvv')"
          @click:append-inner="showCvv = !showCvv"
          @update:model-value="
            model.cvv = String($event ?? '')
              .replace(/\D/g, '')
              .slice(0, 4);
            clearFieldError('billing.cvv');
          "
        />
      </v-col>
      <v-col cols="6" md="2">
        <v-text-field
          :model-value="model.cardExpiryMonth ?? ''"
          type="number"
          label="Mes *"
          required
          min="1"
          max="12"
          :disabled="disabled"
          v-bind="fieldProps('billing.cardExpiryMonth')"
          @update:model-value="
            clearFieldError('billing.cardExpiryMonth');
            model.cardExpiryMonth = $event === '' ? null : Number($event);
          "
        />
      </v-col>
      <v-col cols="6" md="2">
        <v-text-field
          :model-value="model.cardExpiryYear ?? ''"
          type="number"
          label="Año *"
          required
          :disabled="disabled"
          v-bind="fieldProps('billing.cardExpiryYear')"
          @update:model-value="
            clearFieldError('billing.cardExpiryYear');
            model.cardExpiryYear = $event === '' ? null : Number($event);
          "
        />
      </v-col>
    </v-row>

    <v-row v-if="model.holderIsPayer === false" dense class="mt-2">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="model.payerIdentifier"
          label="CUIT / CUIL del pagador *"
          required
          maxlength="11"
          :disabled="disabled"
          v-bind="fieldProps('billing.payerIdentifier')"
          @update:model-value="clearFieldError('billing.payerIdentifier')"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="model.payerEmail"
          label="Email del pagador *"
          required
          type="email"
          :disabled="disabled"
          v-bind="fieldProps('billing.payerEmail')"
          @update:model-value="clearFieldError('billing.payerEmail')"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="model.payerPhone"
          label="Teléfono del pagador *"
          required
          :disabled="disabled"
          v-bind="fieldProps('billing.payerPhone')"
          @update:model-value="clearFieldError('billing.payerPhone')"
        />
      </v-col>
    </v-row>
  </div>
</template>

<style scoped lang="scss">
// Keep financial fields out of login heuristics while preserving the visibility toggles.
.sale-billing-secret--masked :deep(input) {
  -webkit-text-security: disc;
}
</style>
