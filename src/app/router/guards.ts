import type {
  RouteLocationNormalized,
  RouteLocationRaw,
  RouteMeta,
  Router,
  RouteRecordNameGeneric,
} from 'vue-router';
import { useAuthStore, type AuthStatus } from '@/stores/auth.store';

export const ROUTE_NAMES = {
  home: 'home',
  login: 'login',
  changePassword: 'account-change-password',
  forbidden: 'forbidden',
} as const;

export type GuardTarget = {
  name?: RouteRecordNameGeneric | null;
  fullPath: string;
  meta: RouteMeta;
};

export type GuardAuthState = {
  status: AuthStatus;
  mustChangePassword: boolean;
  hasAllPermissions: (codes: readonly string[]) => boolean;
};

/** Accepts only same-app absolute paths to avoid open redirects. */
export function sanitizeRedirect(value: unknown): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string' || !raw.startsWith('/') || raw.startsWith('//')) {
    return null;
  }
  if (raw.startsWith('/login')) {
    return null;
  }
  return raw;
}

/** Pure navigation decision — `true` allows, otherwise returns the redirect target. */
export function resolveAuthNavigation(
  to: GuardTarget,
  auth: GuardAuthState,
): true | RouteLocationRaw {
  if (to.meta.public) {
    return true;
  }

  const authenticated = auth.status === 'authenticated';

  if (to.meta.guestOnly) {
    if (!authenticated) return true;
    return auth.mustChangePassword
      ? { name: ROUTE_NAMES.changePassword }
      : { name: ROUTE_NAMES.home };
  }

  if (to.meta.requiresAuth && !authenticated) {
    return { name: ROUTE_NAMES.login, query: { redirect: to.fullPath } };
  }

  if (authenticated && auth.mustChangePassword && to.name !== ROUTE_NAMES.changePassword) {
    return { name: ROUTE_NAMES.changePassword };
  }

  const required = to.meta.permissions ?? [];
  if (required.length > 0 && !auth.hasAllPermissions(required)) {
    return to.name === ROUTE_NAMES.forbidden ? true : { name: ROUTE_NAMES.forbidden };
  }

  return true;
}

export function installAuthGuards(router: Router): void {
  const auth = useAuthStore();

  router.beforeEach(async (to: RouteLocationNormalized) => {
    await auth.ensureSession();
    return resolveAuthNavigation(to, auth);
  });
}
