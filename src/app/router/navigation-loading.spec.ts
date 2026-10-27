import { afterEach, describe, expect, it } from 'vitest';
import { createMemoryHistory, createRouter } from 'vue-router';
import { resetGlobalLoading, useGlobalLoadingState } from '@/services/http/loading';
import { installNavigationLoading } from './navigation-loading';

function gate() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}
function setup(load: () => Promise<unknown>) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<p>start</p>' } },
      {
        path: '/slow',
        component: async () => {
          await load();
          return { template: '<p>ready</p>' };
        },
      },
      { path: '/blocked', component: { template: '<p>blocked</p>' } },
      { path: '/redirect', redirect: '/' },
    ],
  });
  installNavigationLoading(router);
  return router;
}

describe('navigation loading', () => {
  afterEach(resetGlobalLoading);

  it('holds loading until a cold lazy route resolves and releases on duplicate/redirect', async () => {
    const pending = gate();
    const started = gate();
    const router = setup(async () => {
      started.release();
      await pending.promise;
    });
    await router.push('/');
    const navigation = router.push('/slow');
    await started.promise;
    expect(useGlobalLoadingState().isLoading.value).toBe(true);
    pending.release();
    await navigation;
    expect(useGlobalLoadingState().pendingCount.value).toBe(0);
    await router.push('/slow');
    await router.push('/redirect');
    expect(useGlobalLoadingState().pendingCount.value).toBe(0);
  });

  it('releases the blocker after import errors and guard rejection', async () => {
    const router = setup(async () => {
      throw new Error('chunk failed');
    });
    await router.push('/');
    await expect(router.push('/slow')).rejects.toThrow('chunk failed');
    expect(useGlobalLoadingState().isLoading.value).toBe(false);
    router.beforeEach((to) => (to.path === '/blocked' ? false : true));
    await router.push('/blocked');
    expect(useGlobalLoadingState().pendingCount.value).toBe(0);
  });

  it('does not let a stale navigation release the current navigation', async () => {
    const old = gate();
    const oldStarted = gate();
    const current = gate();
    const currentStarted = gate();
    const router = setup(async () => {
      currentStarted.release();
      await current.promise;
    });
    router.beforeEach(async (to) => {
      if (to.path === '/blocked') {
        oldStarted.release();
        await old.promise;
      }
    });
    await router.push('/');
    const previous = router.push('/blocked');
    await oldStarted.promise;
    const next = router.push('/slow');
    await currentStarted.promise;
    old.release();
    await previous;
    expect(useGlobalLoadingState().pendingCount.value).toBe(1);
    current.release();
    await next;
    expect(useGlobalLoadingState().pendingCount.value).toBe(0);
  });
});
