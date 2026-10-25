import type { QueryClient } from '@tanstack/vue-query';
import type { Router } from 'vue-router';
import { onUnauthorized } from '@/services/http';
import { useAuthStore } from '@/stores/auth.store';
import { ROUTE_NAMES } from './router/guards';

/**
 * Wires the HTTP 401 hook to the auth store and router.
 * Only a previously authenticated session triggers a redirect, which avoids loops during boot
 * (`GET /auth/me` → 401) and on guest pages.
 */
export function installSessionHandlers(router: Router, queryClient: QueryClient): () => void {
  const auth = useAuthStore();

  return onUnauthorized(() => {
    const wasAuthenticated = auth.status === 'authenticated';
    auth.clearSession();
    queryClient.clear();

    const current = router.currentRoute.value;
    if (!wasAuthenticated || current.meta.guestOnly || current.name === ROUTE_NAMES.login) {
      return;
    }

    void router.replace({
      name: ROUTE_NAMES.login,
      query: { redirect: current.fullPath, reason: 'expired' },
    });
  });
}
