import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/AppShellLayout.vue'),
    children: [
      {
        path: '',
        name: 'system-status',
        component: () => import('@/features/system-status/views/SystemStatusView.vue'),
        meta: {
          title: 'System status',
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/features/system-status/views/NotFoundView.vue'),
    meta: {
      title: 'Not found',
    },
  },
];
