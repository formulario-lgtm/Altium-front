import { flushPromises, mount, RouterLinkStub } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import LoginForm from '@/features/auth/components/LoginForm.vue';

function mountForm(props: Record<string, unknown> = {}) {
  return mount(LoginForm, { props, global: { stubs: { RouterLink: RouterLinkStub } } });
}

async function settle(): Promise<void> {
  await flushPromises();
  await new Promise((resolve) => setTimeout(resolve, 20));
  await flushPromises();
}

async function submit(wrapper: ReturnType<typeof mountForm>): Promise<void> {
  await wrapper.get('button[type="submit"]').trigger('click');
  await settle();
}

describe('LoginForm', () => {
  it('shows validation errors and does not submit when empty', async () => {
    const wrapper = mountForm();
    await submit(wrapper);

    expect(wrapper.text()).toContain('Ingresa tu usuario.');
    expect(wrapper.text()).toContain('Ingresa tu contraseña.');
    expect(wrapper.emitted('submit')).toBeUndefined();
  });

  it('rejects email addresses as login usernames', async () => {
    const wrapper = mountForm();
    const email = wrapper.get('input[autocomplete="username"]');
    await email.setValue('ana@altium.example');
    await email.trigger('blur');
    await wrapper.get('input[type="password"]').setValue('anything');
    await settle();
    await submit(wrapper);

    expect(wrapper.emitted('submit')).toBeUndefined();
    expect(wrapper.text()).toMatch(/sin espacios/i);
  });

  it('emits trimmed credentials when valid (no password policy on login)', async () => {
    const wrapper = mountForm();
    await wrapper.get('input[autocomplete="username"]').setValue('  APerez ');
    await wrapper.get('input[type="password"]').setValue('short');
    await settle();
    await submit(wrapper);

    expect(wrapper.emitted('submit')?.[0]).toEqual([
      { username: 'aperez', password: 'short', remember: false },
    ]);
  });

  it('prefills the remembered username and checks remember', async () => {
    const wrapper = mountForm({ initialUsername: 'aperez' });
    await flushPromises();
    const email = wrapper.find('input[autocomplete="username"]');
    expect((email.element as HTMLInputElement).value).toBe('aperez');
    expect((wrapper.get('input[type="checkbox"]').element as HTMLInputElement).checked).toBe(true);
  });

  it('renders the API error message', () => {
    const wrapper = mountForm({ errorMessage: 'Usuario o contraseña incorrectos.' });
    expect(wrapper.get('[role="alert"]').text()).toContain('Usuario o contraseña incorrectos.');
  });
});
