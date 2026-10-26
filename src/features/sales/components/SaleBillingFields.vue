<script setup lang="ts">
import type { SaleFormModel } from '../utils/sale-form-model';
import { fieldErrorProps } from '../utils/sale-field-errors';
import { PAYMENT_METHOD_OPTIONS } from '../utils/sale-labels';
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
      Para tarjeta, completá marca, últimos 4 dígitos y vencimiento. Para débito, ingresá CBU, CVU o
      alias.
    </v-alert>
    <v-row dense>
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
    </v-row>

    <template v-if="model.holderIsPayer === true">
      <v-text-field
        v-if="model.paymentMethod === 'CBU'"
        v-model="model.paymentMedium"
        class="mt-2"
        label="CBU/CVU/ALIAS *"
        required
        :disabled="disabled"
        v-bind="fieldProps('billing.paymentMedium')"
        @update:model-value="clearFieldError('billing.paymentMedium')"
      />
      <v-row v-if="model.paymentMethod === 'CARD'" dense class="mt-2">
        <v-col cols="12" md="4">
          <v-text-field
            v-model="model.cardBrand"
            label="Marca de tarjeta *"
            required
            :disabled="disabled"
            v-bind="fieldProps('billing.cardBrand')"
            @update:model-value="clearFieldError('billing.cardBrand')"
          />
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="model.cardLastFour"
            label="Últimos 4 dígitos *"
            required
            maxlength="4"
            :disabled="disabled"
            v-bind="fieldProps('billing.cardLastFour')"
            @update:model-value="clearFieldError('billing.cardLastFour')"
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
    </template>

    <v-row v-else-if="model.holderIsPayer === false" dense class="mt-2">
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
