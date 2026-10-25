import 'vue-router';

export {};

declare module 'vue-router' {
  interface RouteMeta {
    title?: string;
    /** Requires an authenticated session (inherited by child routes). */
    requiresAuth?: boolean;
    /** Only for signed-out users (login, password recovery). */
    guestOnly?: boolean;
    /** Every listed permission code is required. */
    permissions?: string[];
    /** Reachable by anyone (e.g. not-found). */
    public?: boolean;
  }
}
