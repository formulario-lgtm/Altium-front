import { createRouter, createWebHistory } from 'vue-router';
import { appEnv } from '@/config/env';
import { routes } from './routes';

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.afterEach((to) => {
  const pageTitle = typeof to.meta.title === 'string' ? to.meta.title : 'App';
  document.title = `${pageTitle} · ${appEnv.appTitle}`;
});
