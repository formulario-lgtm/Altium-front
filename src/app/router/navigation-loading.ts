import type { RouteLocationNormalized, Router } from 'vue-router';
import { beginGlobalTask } from '@/services/http/loading';

/** Covers guards and cold lazy imports. A stale/aborted navigation cannot unlock a newer one. */
export function installNavigationLoading(router: Router): () => void {
  let active: { target: RouteLocationNormalized; release: () => void } | undefined;
  const finish = (target: RouteLocationNormalized) => {
    if (active?.target !== target) return;
    active.release();
    active = undefined;
  };
  const removeBefore = router.beforeEach((to) => {
    const release = beginGlobalTask();
    active?.release();
    active = { target: to, release };
  });
  const removeAfter = router.afterEach((to) => finish(to));
  const removeError = router.onError((_error, to) => finish(to));
  return () => {
    removeBefore();
    removeAfter();
    removeError();
    active?.release();
    active = undefined;
  };
}
