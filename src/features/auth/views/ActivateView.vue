<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { apiErrorMessage } from '@/services/http';
import SetPasswordForm from '../components/SetPasswordForm.vue';
import { useActivateAccountMutation } from '../composables/useAuthMutations';
import { useTokenFromQuery } from '../composables/useTokenFromQuery';
import type { SetPasswordValues } from '../schemas/password.schema';

const router = useRouter();
const { token } = useTokenFromQuery();
const mutation = useActivateAccountMutation();

const errorMessage = computed(() =>
  mutation.error.value ? apiErrorMessage(mutation.error.value) : null,
);

async function onSubmit(values: SetPasswordValues): Promise<void> {
  if (!token.value) return;
  try {
    await mutation.mutateAsync({ token: token.value, password: values.newPassword });
  } catch {
    return;
  }
  await router.replace({ name: 'login', query: { reason: 'password-set' } });
}
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Activar cuenta</h1>
    <template v-if="token">
      <p class="text-body-2 text-medium-emphasis mb-6">
        Define tu contraseña para empezar a usar Altium.
      </p>
      <SetPasswordForm
        submit-label="Activar cuenta"
        :loading="mutation.isPending.value"
        :error-message="errorMessage"
        @submit="onSubmit"
      />
    </template>
    <v-alert v-else type="warning" class="my-4">
      El enlace de activación no es válido. Pide a un administrador que te envíe uno nuevo.
    </v-alert>
  </div>
</template>
