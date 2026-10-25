<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import PasswordField from '@/components/common/PasswordField.vue';
import { vuetifyFieldConfig } from '@/composables/vuetifyField';
import { loginSchema, type LoginValues } from '../schemas/auth.schemas';

const props = withDefaults(
  defineProps<{ loading?: boolean; errorMessage?: string | null; initialEmail?: string }>(),
  { loading: false, errorMessage: null, initialEmail: '' },
);

const emit = defineEmits<{ submit: [values: LoginValues] }>();

const { defineField, handleSubmit } = useForm({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: {
    email: props.initialEmail,
    password: '',
    remember: Boolean(props.initialEmail),
  },
});

const [email, emailProps] = defineField('email', vuetifyFieldConfig);
const [password, passwordProps] = defineField('password', vuetifyFieldConfig);
const [remember] = defineField('remember');

const onSubmit = handleSubmit((values) => emit('submit', values));
</script>

<template>
  <v-form novalidate class="login-form" data-testid="login-form" @submit.prevent="onSubmit">
    <v-alert v-if="errorMessage" type="error" density="compact" class="mb-4" role="alert">
      {{ errorMessage }}
    </v-alert>

    <v-text-field
      v-model="email"
      v-bind="emailProps"
      label="Correo electrónico"
      type="email"
      autocomplete="username"
      placeholder="admin@altium.local"
      prepend-inner-icon="mdi-email-outline"
      density="default"
      class="mb-4"
      autofocus
    />
    <PasswordField
      v-model="password"
      v-bind="passwordProps"
      autocomplete="current-password"
      class="mb-2"
    />

    <div class="login-form__row">
      <v-checkbox
        v-model="remember"
        label="Recordar mi correo"
        density="comfortable"
        hide-details
        color="primary"
        class="login-form__remember"
      />
      <router-link :to="{ name: 'forgot-password' }" class="login-form__forgot">
        ¿Olvidaste tu contraseña?
      </router-link>
    </div>

    <button class="login-form__submit" type="submit" :disabled="loading" @click.prevent="onSubmit">
      <span v-if="loading" class="login-form__spinner" aria-hidden="true" />
      <span class="login-form__submit-label">Iniciar sesión</span>
      <v-icon icon="mdi-arrow-right" size="22" aria-hidden="true" />
    </button>
  </v-form>
</template>

<style scoped lang="scss">
.login-form__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.65rem 1.15rem;
  margin: 0.55rem 0 1.6rem;
}

.login-form__forgot {
  font-size: 0.98rem;
  font-weight: 500;
  color: var(--auth-accent, #3b82f6);
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.login-form__forgot:hover {
  color: var(--auth-accent-strong, #2563eb);
}

.login-form__submit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  width: 100%;
  min-height: 3.5rem;
  padding: 1rem 1.35rem;
  border: 0;
  border-radius: 0.85rem;
  cursor: pointer;
  color: #fff;
  /* Mock blue — solid, no nested label background. */
  background: #3b82f6;
  box-shadow: 0 10px 28px rgba(37, 99, 235, 0.35);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background-color 0.15s ease;
}

.login-form__submit:hover:not(:disabled) {
  background: #2563eb;
  box-shadow: 0 12px 32px rgba(37, 99, 235, 0.42);
}

.login-form__submit:active:not(:disabled) {
  transform: translateY(1px);
}

.login-form__submit:disabled {
  cursor: wait;
  opacity: 0.85;
}

.login-form__submit-label {
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.login-form__spinner {
  width: 1.1rem;
  height: 1.1rem;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: login-spin 0.7s linear infinite;
}

@keyframes login-spin {
  to {
    transform: rotate(360deg);
  }
}

:global(.v-theme--light) .login-form__submit {
  box-shadow:
    0 10px 24px rgba(36, 94, 192, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}
</style>
