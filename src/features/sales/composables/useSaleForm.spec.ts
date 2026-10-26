import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, nextTick, ref, type Ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Sale } from '@/services/http';
import { buildSale } from '../../../../tests/e2e/support/api-mock';
import { useSaleForm } from './useSaleForm';

let data: Ref<Sale>;
const mutateAsync = vi.fn();
vi.mock('./useSales', () => ({
  useSaleQuery: () => ({ data }),
  useUpdateSaleMutation: () => ({ mutateAsync }),
}));
let form!: ReturnType<typeof useSaleForm>;
function setup() {
  return mount(
    defineComponent({
      setup() {
        form = useSaleForm(ref('sale-1'));
        return () => null;
      },
    }),
  );
}
describe('sale autosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    data = ref(buildSale());
    mutateAsync.mockReset();
  });
  afterEach(() => vi.useRealTimers());
  it('preserves edits made while a PATCH is in flight, including its query-cache update', async () => {
    const wrapper = setup();
    await nextTick();
    await Promise.resolve();
    let finish!: (sale: Sale) => void;
    mutateAsync.mockReturnValue(
      new Promise<Sale>((resolve) => {
        finish = resolve;
      }),
    );
    form.model.value!.contact.email = 'first@example.com';
    await nextTick();
    const pending = form.persist();
    await flushPromises();
    form.model.value!.contact.email = 'latest@example.com';
    await nextTick();
    const updated = buildSale({
      version: 2,
      contact: { ...data.value.contact!, email: 'first@example.com' },
    });
    data.value = updated;
    await nextTick();
    finish(updated);
    await pending;
    await nextTick();
    expect(form.model.value!.contact.email).toBe('latest@example.com');
    expect(form.model.value!.version).toBe(2);
    expect(form.saveStatus.value).toBe('dirty');
    wrapper.unmount();
  });
  it('cancels a queued debounce when explicitly saving', async () => {
    const wrapper = setup();
    await nextTick();
    await Promise.resolve();
    mutateAsync.mockResolvedValue(buildSale({ version: 2 }));
    form.model.value!.observations = 'Notas';
    await nextTick();
    await form.persist();
    await nextTick();
    await vi.advanceTimersByTimeAsync(1000);
    expect(mutateAsync).toHaveBeenCalledOnce();
    wrapper.unmount();
  });
});
