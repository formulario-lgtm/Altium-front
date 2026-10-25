import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import PasswordField from '@/components/common/PasswordField.vue';

describe('PasswordField', () => {
  it('hides the value by default and toggles visibility', async () => {
    const wrapper = mount(PasswordField, { props: { modelValue: 'Secret12345A' } });
    const input = () => wrapper.get('input');

    expect(input().attributes('type')).toBe('password');
    const toggle = wrapper.get('[data-testid="password-visibility-toggle"]');
    expect(toggle.attributes('aria-label')).toBe('Mostrar contraseña');

    await toggle.trigger('click');
    expect(input().attributes('type')).toBe('text');
    expect(toggle.attributes('aria-label')).toBe('Ocultar contraseña');
  });

  it('emits model updates and shows error messages', async () => {
    const wrapper = mount(PasswordField, {
      props: { modelValue: '', errorMessages: ['Ingresa tu contraseña.'] },
    });
    await wrapper.get('input').setValue('abc');

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual(['abc']);
    expect(wrapper.text()).toContain('Ingresa tu contraseña.');
  });

  it('uses the requested autocomplete hint', () => {
    const wrapper = mount(PasswordField, { props: { autocomplete: 'new-password' } });
    expect(wrapper.get('input').attributes('autocomplete')).toBe('new-password');
  });
});
