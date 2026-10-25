<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ROUTE_NAMES, sanitizeRedirect } from '@/app/router/guards';
import { apiErrorMessage } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import LoginForm from '../components/LoginForm.vue';
import { useLoginMutation } from '../composables/useAuthMutations';
import type { LoginValues } from '../schemas/auth.schemas';
import { readRememberedEmail, saveRememberedEmail } from '../utils/remembered-email';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const loginMutation = useLoginMutation();

const initialEmail = readRememberedEmail();

const notice = computed(() => {
  if (route.query.reason === 'expired') return 'Tu sesión terminó. Iniciá sesión nuevamente.';
  if (route.query.reason === 'password-set')
    return 'Contraseña establecida. Ya podés iniciar sesión.';
  return null;
});

const errorMessage = computed(() =>
  loginMutation.error.value ? apiErrorMessage(loginMutation.error.value) : auth.bootError,
);

async function onSubmit(values: LoginValues): Promise<void> {
  try {
    await loginMutation.mutateAsync({ email: values.email, password: values.password });
  } catch {
    return;
  }
  saveRememberedEmail(values.email, values.remember);

  if (auth.mustChangePassword) {
    await router.replace({ name: ROUTE_NAMES.changePassword });
    return;
  }
  await router.replace(sanitizeRedirect(route.query.redirect) ?? { name: ROUTE_NAMES.home });
}
</script>

<template>
  <div class="login-view">
    <header class="login-view__header">
      <h1 class="login-view__title">Iniciar sesión</h1>
      <p class="login-view__subtitle">Accedé con tu cuenta corporativa.</p>
    </header>

    <v-alert v-if="notice" type="info" density="compact" class="mb-4" variant="tonal">
      {{ notice }}
    </v-alert>

    <LoginForm
      :loading="loginMutation.isPending.value"
      :error-message="errorMessage"
      :initial-email="initialEmail"
      @submit="onSubmit"
    />

    <div class="login-view__secure">
      <div class="login-view__secure-rule" aria-hidden="true">
        <span />
        <v-icon icon="mdi-lock-outline" size="18" />
        <span />
      </div>
      <p class="login-view__secure-text">Acceso restringido a usuarios autorizados.</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-view__header {
  margin-bottom: 1.85rem;
}

.login-view__title {
  margin: 0 0 0.45rem;
  font-size: 1.85rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--auth-text, rgb(var(--v-theme-on-surface)));
}

.login-view__subtitle {
  margin: 0;
  font-size: 1.05rem;
  color: var(--auth-muted, rgba(var(--v-theme-on-surface), 0.7));
}

.login-view__secure {
  margin-top: 2.15rem;
}

.login-view__secure-rule {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.85rem;
  color: var(--auth-muted, rgba(var(--v-theme-on-surface), 0.55));
}

.login-view__secure-rule > span {
  height: 1px;
  background: color-mix(in srgb, var(--auth-muted, #9eb0c9) 35%, transparent);
}

.login-view__secure-text {
  margin: 1rem 0 0;
  text-align: center;
  font-size: 0.85rem;
  color: var(--auth-muted, rgba(var(--v-theme-on-surface), 0.6));
}
</style>
