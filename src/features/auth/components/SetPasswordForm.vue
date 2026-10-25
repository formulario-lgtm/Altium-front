<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import PasswordField from '@/components/common/PasswordField.vue';
import { vuetifyFieldConfig } from '@/composables/vuetifyField';
import {
  PASSWORD_POLICY_HINT,
  setPasswordSchema,
  type SetPasswordValues,
} from '../schemas/password.schema';

withDefaults(
  defineProps<{ submitLabel: string; loading?: boolean; errorMessage?: string | null }>(),
  { loading: false, errorMessage: null },
);

const emit = defineEmits<{ submit: [values: SetPasswordValues] }>();

const { defineField, handleSubmit } = useForm({
  validationSchema: toTypedSchema(setPasswordSchema),
  initialValues: { newPassword: '', confirmPassword: '' },
});

const [newPassword, newPasswordProps] = defineField('newPassword', vuetifyFieldConfig);
const [confirmPassword, confirmPasswordProps] = defineField('confirmPassword', vuetifyFieldConfig);

const onSubmit = handleSubmit((values) => emit('submit', values));
</script>

<template>
  <v-form novalidate @submit.prevent="onSubmit">
    <v-alert v-if="errorMessage" type="error" density="compact" class="mb-4" role="alert">
      {{ errorMessage }}
    </v-alert>
    <PasswordField
      v-model="newPassword"
      v-bind="newPasswordProps"
      label="Nueva contraseña"
      autocomplete="new-password"
      :hint="PASSWORD_POLICY_HINT"
      class="mb-4"
    />
    <PasswordField
      v-model="confirmPassword"
      v-bind="confirmPasswordProps"
      label="Repetir contraseña"
      autocomplete="new-password"
      class="mb-6"
    />
    <v-btn type="submit" color="primary" size="large" block :loading="loading">
      {{ submitLabel }}
    </v-btn>
  </v-form>
</template>
