<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import PageHeader from '@/components/common/PageHeader.vue';
import PasswordField from '@/components/common/PasswordField.vue';
import { vuetifyFieldConfig } from '@/composables/vuetifyField';
import { useChangePasswordMutation } from '@/features/auth/composables/useAuthMutations';
import {
  changePasswordSchema,
  PASSWORD_POLICY_HINT,
} from '@/features/auth/schemas/password.schema';
import { apiErrorMessage, isApiError } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';

const auth = useAuthStore();
const router = useRouter();
const mutation = useChangePasswordMutation();
const changed = ref(false);
const wasForced = auth.mustChangePassword;

const { defineField, handleSubmit, resetForm, setFieldError } = useForm({
  validationSchema: toTypedSchema(changePasswordSchema),
  initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
});

const [currentPassword, currentPasswordProps] = defineField('currentPassword', vuetifyFieldConfig);
const [newPassword, newPasswordProps] = defineField('newPassword', vuetifyFieldConfig);
const [confirmPassword, confirmPasswordProps] = defineField('confirmPassword', vuetifyFieldConfig);

const errorMessage = computed(() => {
  const error = mutation.error.value;
  if (!error) return null;
  if (isApiError(error) && error.code === 'AUTH_INVALID_CREDENTIALS') return null;
  return apiErrorMessage(error);
});

const onSubmit = handleSubmit(async (values) => {
  changed.value = false;
  try {
    await mutation.mutateAsync({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  } catch (error) {
    if (isApiError(error) && error.code === 'AUTH_INVALID_CREDENTIALS') {
      setFieldError('currentPassword', 'La contraseña actual no es correcta.');
    }
    return;
  }
  resetForm();
  changed.value = true;
  if (wasForced) {
    await router.replace({ name: 'home' });
  }
});
</script>

<template>
  <div style="max-width: 520px">
    <PageHeader
      title="Cambiar contraseña"
      subtitle="Al cambiarla se cierran tus otras sesiones; esta sesión sigue activa."
    />

    <v-alert v-if="auth.mustChangePassword" type="warning" class="mb-4">
      Debes cambiar tu contraseña antes de continuar usando Altium.
    </v-alert>
    <v-alert v-if="changed" type="success" class="mb-4" data-testid="change-password-success">
      Contraseña actualizada.
    </v-alert>

    <v-card>
      <v-card-text>
        <v-form novalidate @submit.prevent="onSubmit">
          <v-alert v-if="errorMessage" type="error" density="compact" class="mb-4" role="alert">
            {{ errorMessage }}
          </v-alert>
          <PasswordField
            v-model="currentPassword"
            v-bind="currentPasswordProps"
            label="Contraseña actual"
            autocomplete="current-password"
            class="mb-4"
          />
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
            label="Repetir nueva contraseña"
            autocomplete="new-password"
            class="mb-6"
          />
          <v-btn type="submit" color="primary" :loading="mutation.isPending.value">
            Guardar contraseña
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>
