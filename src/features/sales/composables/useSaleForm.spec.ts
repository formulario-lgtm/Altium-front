import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, nextTick, ref, type Ref } from 'vue';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, type Sale } from '@/services/http';
import { buildSale } from '../../../../tests/e2e/support/api-mock';
import { useSaleForm } from './useSaleForm';

let data: Ref<Sale>;
const mutateAsync = vi.fn();
const refetch = vi.fn();
vi.mock('./useSales', () => ({
  useSaleQuery: () => ({ data, refetch }),
  useUpdateSaleMutation: () => ({ mutateAsync }),
}));
let form!: ReturnType<typeof useSaleForm>;
let id: Ref<string>;
function setup() {
  id = ref(data.value.id);
  return mount(
    defineComponent({
      setup() {
        form = useSaleForm(id);
        return () => null;
      },
    }),
  );
}

describe('explicit and section-change draft saving', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    data = ref(buildSale());
    mutateAsync.mockReset();
    refetch.mockReset();
  });
  afterEach(() => vi.useRealTimers());
  it('blocks invalid supplied data before sending and permits saving after correction', async () => {
    const wrapper = setup();
    form.model.value!.members[0]!.cuil = '20346737751';
    expect(form.fieldErrors.value).toEqual({});
    expect(await form.persist()).toBeNull();
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(form.fieldErrors.value['members[0].cuil']).toContain('verificador');
    form.model.value!.members[0]!.cuil = null;
    mutateAsync.mockResolvedValue(buildSale({ version: 2 }));
    expect(await form.persist()).not.toBeNull();
    expect(form.fieldErrors.value).toEqual({});
    expect(mutateAsync).toHaveBeenCalledOnce();
    wrapper.unmount();
  });
  it('tracks typing without starting a debounce, PATCH or follow-up timer', async () => {
    const wrapper = setup();
    form.model.value!.observations = 'Escribiendo';
    await vi.advanceTimersByTimeAsync(10_000);
    expect(mutateAsync).not.toHaveBeenCalled();
    expect(form.saveStatus.value).toBe('dirty');
    expect(form.hasUnsavedChanges.value).toBe(true);
    wrapper.unmount();
  });
  it('saves explicitly once and skips queued or subsequent identical saves', async () => {
    const wrapper = setup();
    mutateAsync.mockResolvedValue(buildSale({ version: 2 }));
    form.model.value!.observations = 'Notas';
    const model = form.model.value;
    await Promise.all([form.persist(), form.persist()]);
    await form.persist();
    await vi.advanceTimersByTimeAsync(5000);
    expect(mutateAsync).toHaveBeenCalledOnce();
    expect(form.model.value).toBe(model);
    expect(form.model.value!.observations).toBe('Notas');
    expect(form.saveStatus.value).toBe('saved');
    expect(form.hasUnsavedChanges.value).toBe(false);
    wrapper.unmount();
  });
  it('does not save when a clean section is left, but supports final presentation verification', async () => {
    const wrapper = setup();
    await form.persist();
    expect(mutateAsync).not.toHaveBeenCalled();
    mutateAsync.mockResolvedValue(buildSale({ version: 2 }));
    await form.persist({ force: true });
    expect(mutateAsync).toHaveBeenCalledOnce();
    wrapper.unmount();
  });
  it('preserves focus-bearing model references, newer keystrokes and a detached request snapshot', async () => {
    const wrapper = setup();
    let finish!: (sale: Sale) => void;
    mutateAsync.mockReturnValueOnce(
      new Promise<Sale>((resolve) => {
        finish = resolve;
      }),
    );
    const model = form.model.value!;
    const contact = model.contact;
    model.contact.email = 'first@example.com';
    const pending = form.persist();
    await flushPromises();
    model.contact.email = 'latest@example.com';
    expect(mutateAsync.mock.calls[0]![0].body.contact.email).toBe('first@example.com');
    const updated = buildSale({
      version: 2,
      contact: { ...data.value.contact!, email: 'first@example.com' },
    });
    data.value = updated;
    await nextTick();
    finish(updated);
    await pending;
    expect(form.model.value).toBe(model);
    expect(form.model.value!.contact).toBe(contact);
    expect(model.contact.email).toBe('latest@example.com');
    expect(model.version).toBe(2);
    expect(form.saveStatus.value).toBe('dirty');
    await vi.advanceTimersByTimeAsync(5000);
    expect(mutateAsync).toHaveBeenCalledOnce();
    mutateAsync.mockResolvedValue(buildSale({ version: 3 }));
    await form.persist();
    expect(mutateAsync.mock.calls[1]![0].body.version).toBe(2);
    expect(mutateAsync.mock.calls[1]![0].body.contact.email).toBe('latest@example.com');
    wrapper.unmount();
  });
  it('serializes section saves requested while another PATCH is pending', async () => {
    const wrapper = setup();
    let finish!: (sale: Sale) => void;
    mutateAsync.mockReturnValueOnce(
      new Promise<Sale>((resolve) => {
        finish = resolve;
      }),
    );
    form.model.value!.observations = 'Primera sección';
    const first = form.persist();
    await flushPromises();
    form.model.value!.contact.email = 'next@example.com';
    const second = form.persist();
    expect(mutateAsync).toHaveBeenCalledOnce();
    mutateAsync.mockResolvedValue(buildSale({ version: 3 }));
    finish(buildSale({ version: 2 }));
    await Promise.all([first, second]);
    expect(mutateAsync).toHaveBeenCalledTimes(2);
    expect(mutateAsync.mock.calls[1]![0].body.version).toBe(2);
    expect(form.hasUnsavedChanges.value).toBe(false);
    wrapper.unmount();
  });
  it('assigns persisted identities to the correct new family member without replacing newer members', async () => {
    const wrapper = setup();
    const newMember = {
      ...form.model.value!.members[0]!,
      id: undefined,
      memberType: 'CHILD' as const,
      firstName: 'Hijo',
    };
    form.model.value!.members.push(newMember);
    let finish!: (sale: Sale) => void;
    mutateAsync.mockReturnValueOnce(
      new Promise<Sale>((resolve) => {
        finish = resolve;
      }),
    );
    const pending = form.persist();
    await flushPromises();
    form.model.value!.members.push({ ...newMember, firstName: 'Otro hijo' });
    const updated = buildSale({ version: 2 });
    updated.members.push({
      ...updated.members[0]!,
      id: 'new-child',
      memberType: 'CHILD',
      firstName: 'Hijo',
      displayOrder: 1,
    });
    finish(updated);
    await pending;
    expect(form.model.value!.members[1]!.id).toBe('new-child');
    expect(form.model.value!.members[2]!.id).toBeUndefined();
    expect(form.saveStatus.value).toBe('dirty');
    wrapper.unmount();
  });
  it('preserves failed edits and a version conflict until explicit recovery', async () => {
    const wrapper = setup();
    form.model.value!.observations = 'No perder';
    mutateAsync.mockRejectedValue(
      new ApiError({
        kind: 'conflict',
        status: 409,
        code: 'VERSION_CONFLICT',
        message: 'Conflicto',
      }),
    );
    await form.persist();
    data.value = buildSale({ version: 3, observations: 'Actualizada por otra sesión' });
    await nextTick();
    expect(form.model.value!.observations).toBe('No perder');
    expect(form.versionConflict.value).toBe(true);
    await form.persist();
    expect(mutateAsync).toHaveBeenCalledOnce();
    refetch.mockResolvedValue({ data: data.value, error: null });
    await form.reloadFromServer();
    expect(form.model.value!.observations).toBe('Actualizada por otra sesión');
    expect(form.versionConflict.value).toBe(false);
    expect(form.hasUnsavedChanges.value).toBe(false);
    wrapper.unmount();
  });
  it('does not apply an old response to another sale reused by the route', async () => {
    const wrapper = setup();
    let finish!: (sale: Sale) => void;
    mutateAsync.mockReturnValueOnce(
      new Promise<Sale>((resolve) => {
        finish = resolve;
      }),
    );
    form.model.value!.observations = 'Venta anterior';
    const pending = form.persist();
    await flushPromises();
    id.value = 'next-sale';
    data.value = buildSale({ id: 'next-sale', version: 9, observations: 'Otra venta' });
    await nextTick();
    finish(buildSale({ version: 2 }));
    await pending;
    expect(form.model.value!.version).toBe(9);
    expect(form.model.value!.observations).toBe('Otra venta');
    wrapper.unmount();
  });
});
