<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { computed, ref } from 'vue';
import { vuetifyFieldConfig } from '@/composables/vuetifyField';
import { apiErrorMessage } from '@/services/http';
import { useForgotPasswordMutation } from '../composables/useAuthMutations';
import { forgotPasswordSchema } from '../schemas/auth.schemas';
import { readRememberedEmail } from '../utils/remembered-email';

const mutation = useForgotPasswordMutation();
const submitted = ref(false);

const { defineField, handleSubmit } = useForm({
  validationSchema: toTypedSchema(forgotPasswordSchema),
  initialValues: { email: readRememberedEmail() },
});
const [email, emailProps] = defineField('email', vuetifyFieldConfig);

/** The backend answers 200 for any email, so errors here are transport, validation or rate limit. */
const errorMessage = computed(() =>
  mutation.error.value ? apiErrorMessage(mutation.error.value) : null,
);

const onSubmit = handleSubmit(async (values) => {
  try {
    await mutation.mutateAsync({ email: values.email });
    submitted.value = true;
  } catch {
    // errorMessage renders the failure.
  }
});
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-1">Recuperar contraseña</h1>

    <template v-if="submitted">
      <v-alert type="success" class="my-4" data-testid="forgot-password-success">
        Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.
      </v-alert>
      <p class="text-body-2 text-medium-emphasis">
        Si no recibes nada en unos minutos, contacta a un administrador para que te envíe un nuevo
        enlace.
      </p>
      <v-btn :to="{ name: 'login' }" variant="outlined" block>Volver a iniciar sesión</v-btn>
    </template>

    <v-form v-else novalidate @submit.prevent="onSubmit">
      <p class="text-body-2 text-medium-emphasis mb-6">
        Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
      </p>
      <v-alert v-if="errorMessage" type="error" density="compact" class="mb-4" role="alert">
        {{ errorMessage }}
      </v-alert>
      <v-text-field
        v-model="email"
        v-bind="emailProps"
        label="Correo electrónico"
        type="email"
        autocomplete="username"
        prepend-inner-icon="mdi-email-outline"
        class="mb-4"
        autofocus
      />
      <v-btn type="submit" color="primary" size="large" block :loading="mutation.isPending.value">
        Enviar instrucciones
      </v-btn>
      <div class="text-center mt-4">
        <router-link :to="{ name: 'login' }" class="text-body-2"
          >Volver a iniciar sesión</router-link
        >
      </div>
    </v-form>
  </div>
</template>
