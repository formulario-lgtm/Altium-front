import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import StatusBadge from '@/components/common/StatusBadge.vue';

describe('StatusBadge', () => {
  it.each([
    ['ACTIVE', 'Activo'],
    ['PENDING', 'Pendiente'],
    ['SUSPENDED', 'Suspendido'],
    ['DISABLED', 'Deshabilitado'],
    ['SUCCESS', 'Éxito'],
    ['FAILURE', 'Fallo'],
    ['DRAFT', 'Borrador'],
    ['SUBMITTED', 'Presentada'],
    ['RETURNED', 'Devuelta'],
  ])('renders %s as %s', (status, label) => {
    const wrapper = mount(StatusBadge, { props: { status } });
    expect(wrapper.text()).toContain(label);
    expect(wrapper.attributes('data-status')).toBe(status);
  });

  it('falls back to the raw code and accepts a custom label', () => {
    expect(mount(StatusBadge, { props: { status: 'UNKNOWN' } }).text()).toContain('UNKNOWN');
    expect(mount(StatusBadge, { props: { status: 'ACTIVE', label: 'Vigente' } }).text()).toContain(
      'Vigente',
    );
  });
});
