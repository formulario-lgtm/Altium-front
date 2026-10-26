<script setup lang="ts">
import type { SaleFormModel } from '../utils/sale-form-model';
import { fieldErrorProps } from '../utils/sale-field-errors';
import { ARGENTINA_PROVINCES } from '../utils/sale-labels';
const model = defineModel<SaleFormModel['contact']>({ required: true });
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
    <h2 class="text-h6 mb-4">Contacto y domicilio</h2>
    <v-row dense>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="model.areaCode"
          label="Código de área *"
          required
          :disabled="disabled"
          v-bind="fieldProps('contact.areaCode')"
          @update:model-value="clearFieldError('contact.areaCode')"
        />
      </v-col>
      <v-col cols="12" md="3">
        <v-text-field
          v-model="model.phone"
          label="Teléfono *"
          required
          :disabled="disabled"
          v-bind="fieldProps('contact.phone')"
          @update:model-value="clearFieldError('contact.phone')"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="model.email"
          label="Email *"
          required
          type="email"
          :disabled="disabled"
          v-bind="fieldProps('contact.email')"
          @update:model-value="clearFieldError('contact.email')"
        />
      </v-col>
      <v-col cols="12">
        <v-text-field
          v-model="model.address"
          label="Domicilio *"
          required
          :disabled="disabled"
          v-bind="fieldProps('contact.address')"
          @update:model-value="clearFieldError('contact.address')"
        />
      </v-col>
      <v-col cols="12" md="4">
        <v-text-field
          v-model="model.postalCode"
          label="Código postal *"
          required
          :disabled="disabled"
          v-bind="fieldProps('contact.postalCode')"
          @update:model-value="clearFieldError('contact.postalCode')"
        />
      </v-col>
      <v-col cols="12" md="8">
        <v-select
          v-model="model.province"
          :items="ARGENTINA_PROVINCES"
          label="Provincia *"
          required
          clearable
          :disabled="disabled"
          v-bind="fieldProps('contact.province')"
          @update:model-value="clearFieldError('contact.province')"
        />
      </v-col>
    </v-row>
  </div>
</template>
