<script setup lang="ts">
import type { SaleFormModel } from '../utils/sale-form-model';
import { fieldErrorProps } from '../utils/sale-field-errors';
import { MONOTAX_CATEGORIES } from '../utils/sale-labels';
const model = defineModel<SaleFormModel['taxInfo']>({ required: true });
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
    <h2 class="text-h6 mb-4">Situación impositiva</h2>
    <v-row dense>
      <v-col cols="12" md="4">
        <v-select
          v-model="model.monotaxCategory"
          :items="MONOTAX_CATEGORIES"
          label="Categoría de monotributo *"
          required
          clearable
          :disabled="disabled"
          v-bind="fieldProps('taxInfo.monotaxCategory')"
          @update:model-value="clearFieldError('taxInfo.monotaxCategory')"
        />
      </v-col>
      <v-col cols="12" md="8">
        <v-text-field
          v-model="model.currentInsurance"
          label="Obra social actual *"
          required
          :disabled="disabled"
          v-bind="fieldProps('taxInfo.currentInsurance')"
          @update:model-value="clearFieldError('taxInfo.currentInsurance')"
        />
      </v-col>
    </v-row>
  </div>
</template>
