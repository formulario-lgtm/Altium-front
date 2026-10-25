import type { RouteComponent, RouteRecordRaw } from 'vue-router';

/** Guest page wrapped in `AuthLayout`; one parent per path so nothing collides with `/`. */
function guestRoute(
  path: string,
  name: string,
  title: string,
  component: () => Promise<RouteComponent>,
): RouteRecordRaw {
  return {
    path,
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { guestOnly: true },
    children: [{ path: '', name, component, meta: { title, guestOnly: true } }],
  };
}

export const routes: RouteRecordRaw[] = [
  guestRoute(
    '/login',
    'login',
    'Iniciar sesión',
    () => import('@/features/auth/views/LoginView.vue'),
  ),
  guestRoute(
    '/forgot-password',
    'forgot-password',
    'Recuperar contraseña',
    () => import('@/features/auth/views/ForgotPasswordView.vue'),
  ),
  guestRoute(
    '/reset-password',
    'reset-password',
    'Restablecer contraseña',
    () => import('@/features/auth/views/ResetPasswordView.vue'),
  ),
  guestRoute(
    '/activate',
    'activate',
    'Activar cuenta',
    () => import('@/features/auth/views/ActivateView.vue'),
  ),
  {
    path: '/',
    component: () => import('@/layouts/AppShellLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/features/home/views/HomeView.vue'),
        meta: { title: 'Inicio' },
      },
      {
        path: 'account/change-password',
        name: 'account-change-password',
        component: () => import('@/features/account/views/ChangePasswordView.vue'),
        meta: { title: 'Cambiar contraseña' },
      },
      {
        path: 'account/sessions',
        name: 'account-sessions',
        component: () => import('@/features/account/views/SessionsView.vue'),
        meta: { title: 'Sesiones activas' },
      },
      {
        path: 'sales',
        name: 'sales',
        component: () => import('@/features/sales/views/SalesListView.vue'),
        meta: { title: 'Mis ventas', permissions: ['sales.read'] },
      },
      {
        path: 'sales/new',
        name: 'sale-new',
        component: () => import('@/features/sales/views/SaleCreateView.vue'),
        meta: { title: 'Nueva venta', permissions: ['sales.create'] },
      },
      {
        path: 'sales/:id',
        name: 'sale-detail',
        component: () => import('@/features/sales/views/SaleDetailView.vue'),
        meta: { title: 'Detalle de venta', permissions: ['sales.read'] },
      },
      {
        path: 'sales/:id/edit',
        name: 'sale-edit',
        component: () => import('@/features/sales/views/SaleFormView.vue'),
        meta: { title: 'Editar venta', permissions: ['sales.update'] },
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/features/users/views/UsersView.vue'),
        meta: { title: 'Usuarios', permissions: ['users.read'] },
      },
      {
        path: 'teams',
        name: 'teams',
        component: () => import('@/features/teams/views/TeamsView.vue'),
        meta: { title: 'Equipos', permissions: ['teams.read'] },
      },
      {
        path: 'teams/:id',
        name: 'team-detail',
        component: () => import('@/features/teams/views/TeamDetailView.vue'),
        meta: { title: 'Equipo', permissions: ['teams.read'] },
      },
      {
        path: 'roles',
        name: 'roles',
        component: () => import('@/features/roles/views/RolesView.vue'),
        meta: { title: 'Roles y permisos', permissions: ['roles.read'] },
      },
      {
        path: 'audit',
        name: 'audit',
        component: () => import('@/features/audit/views/AuditView.vue'),
        meta: { title: 'Auditoría', permissions: ['audit.read'] },
      },
      {
        path: 'system',
        name: 'system-status',
        component: () => import('@/features/system-status/views/SystemStatusView.vue'),
        meta: { title: 'Estado del sistema' },
      },
      {
        path: 'forbidden',
        name: 'forbidden',
        component: () => import('@/features/system-status/views/ForbiddenView.vue'),
        meta: { title: 'Acceso denegado' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/features/system-status/views/NotFoundView.vue'),
    meta: { title: 'No encontrado', public: true },
  },
];
