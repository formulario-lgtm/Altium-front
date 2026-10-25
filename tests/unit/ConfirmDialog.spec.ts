import { flushPromises, mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import ConfirmDialog from '@/components/common/ConfirmDialog.vue';

function findButton(text: string): HTMLButtonElement | undefined {
  return [...document.querySelectorAll<HTMLButtonElement>('button')].find((button) =>
    button.textContent?.includes(text),
  );
}

describe('ConfirmDialog', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders title/message and emits confirm', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: { modelValue: true, title: 'Suspender usuario', message: 'Se cerrarán sesiones.' },
      attachTo: document.body,
    });
    await flushPromises();

    expect(document.body.textContent).toContain('Suspender usuario');
    expect(document.body.textContent).toContain('Se cerrarán sesiones.');

    findButton('Confirmar')?.click();
    expect(wrapper.emitted('confirm')).toHaveLength(1);
    wrapper.unmount();
  });

  it('closes and emits cancel', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: { modelValue: true, title: 'Quitar miembro' },
      attachTo: document.body,
    });
    await flushPromises();

    findButton('Cancelar')?.click();
    expect(wrapper.emitted('cancel')).toHaveLength(1);
    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([false]);
    wrapper.unmount();
  });

  it('shows an error message when provided', async () => {
    const wrapper = mount(ConfirmDialog, {
      props: { modelValue: true, title: 'Guardar', errorMessage: 'Conflicto' },
      attachTo: document.body,
    });
    await flushPromises();

    expect(document.body.querySelector('[role="alert"]')?.textContent).toContain('Conflicto');
    wrapper.unmount();
  });
});
