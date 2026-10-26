<script setup lang="ts">
import type { SaleFormModel } from '../utils/sale-form-model';
import { fieldErrorProps } from '../utils/sale-field-errors';
const model = defineModel<SaleFormModel['employment']>({ required: true });
const props = defineProps<{ disabled?: boolean; fieldErrors: Readonly<Record<string, string>> }>();
const emit = defineEmits<{ 'clear-field-error': [string] }>();
function fieldProps(path: string) {
  return fieldErrorProps(props.fieldErrors, path);
}
function clearFieldError(path: string) {
  emit('clear-field-error', path);
}
function addEmployer() {
  model.value.employers.push({ employerCuit: '', displayOrder: model.value.employers.length });
}
</script>
<template>
  <div>
    <h2 class="text-h6 mb-4">Situación laboral</h2>
    <div
      v-for="(employer, index) in model.employers"
      :key="employer.id ?? index"
      class="d-flex ga-2 align-center mb-2"
    >
      <v-text-field
        v-model="employer.employerCuit"
        :label="`CUIT empleador ${index + 1} *`"
        required
        maxlength="11"
        :disabled="disabled"
        v-bind="fieldProps(`employment.employers[${index}].employerCuit`)"
        @update:model-value="clearFieldError(`employment.employers[${index}].employerCuit`)"
      />
      <v-btn
        v-if="index > 0 && !disabled"
        icon="mdi-close"
        variant="text"
        aria-label="Quitar empleador"
        @click="model.employers.splice(index, 1)"
      />
    </div>
    <v-btn v-if="!disabled" class="mb-4" variant="tonal" @click="addEmployer">
      + Agregar CUIT empleador
    </v-btn>
    <v-row dense>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="model.currentInsurance"
          label="Obra social actual *"
          required
          :disabled="disabled"
          v-bind="fieldProps('employment.currentInsurance')"
          @update:model-value="clearFieldError('employment.currentInsurance')"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          :model-value="model.grossSalary ?? ''"
          type="number"
          label="Sueldo bruto (s/ aporte) *"
          required
          step="0.01"
          :disabled="disabled"
          v-bind="fieldProps('employment.grossSalary')"
          @update:model-value="
            clearFieldError('employment.grossSalary');
            model.grossSalary = $event === '' ? null : Number($event);
          "
        />
      </v-col>
    </v-row>
  </div>
</template>
