import { onMounted, onScopeDispose, ref, watch } from 'vue';
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import type { useSaleForm } from './useSaleForm';

export function useSaleLeaveGuard(form: ReturnType<typeof useSaleForm>) {
  const auth = useAuthStore();
  const open = ref(false);
  let resolve: ((leave: boolean) => void) | undefined;
  function finish(leave: boolean): void {
    const pending = resolve;
    resolve = undefined;
    open.value = false;
    pending?.(leave);
  }
  async function canLeave(): Promise<boolean> {
    if (!auth.isAuthenticated) return true;
    await form.waitForPendingSave();
    if (!auth.isAuthenticated || !form.hasUnsavedChanges.value) return true;
    finish(false);
    return new Promise<boolean>((done) => {
      resolve = done;
      open.value = true;
    });
  }
  onBeforeRouteLeave(canLeave);
  onBeforeRouteUpdate((to, from) => (to.params.id === from.params.id ? true : canLeave()));
  watch(open, (value) => {
    if (!value) finish(false);
  });
  function beforeUnload(event: BeforeUnloadEvent): void {
    if (!form.hasUnsavedChanges.value && form.saveStatus.value !== 'saving') return;
    event.preventDefault();
    event.returnValue = '';
  }
  onMounted(() => window.addEventListener('beforeunload', beforeUnload));
  onScopeDispose(() => {
    window.removeEventListener('beforeunload', beforeUnload);
    finish(false);
  });
  return { open, confirm: () => finish(true), cancel: () => finish(false) };
}
