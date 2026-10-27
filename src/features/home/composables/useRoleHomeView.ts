import {
  nextTick,
  ref,
  shallowRef,
  toValue,
  watch,
  type Component,
  type MaybeRefOrGetter,
} from 'vue';
import { beginGlobalTask } from '@/services/http/loading';
import type { HomeRoleVariant } from '../utils/home-labels';

const loaders = {
  admin: () => import('../views/AdminHomeView.vue'),
  administrative: () => import('../views/AdministrativeHomeView.vue'),
  supervisor: () => import('../views/SupervisorHomeView.vue'),
  seller: () => import('../views/SellerHomeView.vue'),
};

/** Load only the selected role. Hold the blocker until setup/render has started its queries. */
export function useRoleHomeView(variant: MaybeRefOrGetter<HomeRoleVariant>) {
  const view = shallowRef<Component | null>(null);
  const failed = ref(false);
  watch(
    () => toValue(variant),
    async (role, _previous, onCleanup) => {
      let canceled = false;
      const release = beginGlobalTask();
      onCleanup(() => {
        canceled = true;
        release();
      });
      view.value = null;
      failed.value = false;
      try {
        if (role !== 'fallback') {
          const loaded = await loaders[role]();
          if (!canceled) view.value = loaded.default;
        }
        await nextTick();
      } catch {
        if (!canceled) failed.value = true;
      } finally {
        release();
      }
    },
    { immediate: true },
  );
  return {
    view,
    failed,
    retry: () => {
      window.location.reload();
    },
  };
}
