import { describe, expect, it } from 'vitest';
import {
  formatAuditPayload,
  REDACTED,
  sanitizeAuditPayload,
} from '@/features/audit/utils/sanitize-json';
import {
  readRememberedEmail,
  REMEMBERED_EMAIL_KEY,
  saveRememberedEmail,
} from '@/features/auth/utils/remembered-email';
import {
  groupPermissionsByResource,
  isProtectedPermission,
  sameCodes,
} from '@/features/roles/utils/permissions';
import { toCreateTeamBody, toUpdateTeamBody } from '@/features/teams/utils/team-payload';
import { ageFromBirthDate, canEditSaleStatus, showFum } from '@/features/sales/utils/sale-labels';
import { formModelToUpdateBody, saleToFormModel } from '@/features/sales/utils/sale-form-model';
import { saleListSearchParams } from '@/features/sales/utils/sale-search';
import { availableStatusTargets, canSendPasswordLink } from '@/features/users/utils/user-actions';
import type { Permission, Sale, Team } from '@/services/http';

describe('sanitizeAuditPayload', () => {
  it('redacts sensitive keys at any depth', () => {
    const result = sanitizeAuditPayload({
      status: 'ACTIVE',
      passwordHash: 'x',
      nested: { csrfToken: 'y', list: [{ apiKey: 'z', ok: 1 }] },
    });
    expect(result).toEqual({
      status: 'ACTIVE',
      passwordHash: REDACTED,
      nested: { csrfToken: REDACTED, list: [{ apiKey: REDACTED, ok: 1 }] },
    });
  });

  it('formats null as null and objects as JSON', () => {
    expect(formatAuditPayload(null)).toBeNull();
    expect(formatAuditPayload({ a: 1 })).toBe('{\n  "a": 1\n}');
  });
});

describe('remembered email', () => {
  it('stores only the email and removes it when unchecked', () => {
    saveRememberedEmail('ana@altium.example', true);
    expect(readRememberedEmail()).toBe('ana@altium.example');
    expect(Object.keys(window.localStorage)).toEqual([REMEMBERED_EMAIL_KEY]);

    saveRememberedEmail('ana@altium.example', false);
    expect(readRememberedEmail()).toBe('');
  });
});

describe('role permissions helpers', () => {
  const permission = (code: string): Permission => {
    const [resource = '', action = ''] = code.split('.');
    return { id: code, code, resource, action, description: null };
  };

  it('groups by resource in product order with Spanish labels', () => {
    const groups = groupPermissionsByResource([
      permission('users.update'),
      permission('audit.read'),
      permission('users.read'),
    ]);
    expect(groups.map((g) => g.resource)).toEqual(['users', 'audit']);
    expect(groups.map((g) => g.label)).toEqual(['Usuarios', 'Auditoría']);
    expect(groups[0]?.items.map((p) => p.code)).toEqual(['users.read', 'users.update']);
  });

  it('protects SUPER_ADMIN permissions only', () => {
    expect(isProtectedPermission('SUPER_ADMIN', 'roles.read')).toBe(true);
    expect(isProtectedPermission('SUPER_ADMIN', 'teams.read')).toBe(false);
    expect(isProtectedPermission('SUPERVISOR', 'roles.read')).toBe(false);
  });

  it('compares code sets ignoring order', () => {
    expect(sameCodes(['a', 'b'], ['b', 'a'])).toBe(true);
    expect(sameCodes(['a'], ['a', 'b'])).toBe(false);
  });
});

describe('user actions', () => {
  it('never offers ACTIVE to pending users nor the current status', () => {
    expect(availableStatusTargets({ status: 'PENDING' })).toEqual(['SUSPENDED', 'DISABLED']);
    expect(availableStatusTargets({ status: 'ACTIVE' })).toEqual(['SUSPENDED', 'DISABLED']);
    expect(availableStatusTargets({ status: 'SUSPENDED' })).toEqual(['ACTIVE', 'DISABLED']);
  });

  it('sends links only to pending/active users', () => {
    expect(canSendPasswordLink({ status: 'PENDING' })).toBe(true);
    expect(canSendPasswordLink({ status: 'ACTIVE' })).toBe(true);
    expect(canSendPasswordLink({ status: 'SUSPENDED' })).toBe(false);
  });
});

describe('sales helpers', () => {
  it('routes list search to saleNumber or holderName', () => {
    expect(saleListSearchParams('V-00012')).toEqual({ saleNumber: 'V-00012' });
    expect(saleListSearchParams('12')).toEqual({ saleNumber: '12' });
    expect(saleListSearchParams('Pérez')).toEqual({ holderName: 'Pérez' });
    expect(saleListSearchParams('  ')).toEqual({});
  });

  it('calculates age and FUM visibility without persisting age', () => {
    expect(ageFromBirthDate('2010-01-01')).toBeGreaterThanOrEqual(15);
    expect(showFum('FEMALE', '2010-01-01')).toBe(true);
    expect(showFum('MALE', '2010-01-01')).toBe(false);
    expect(showFum('FEMALE', '2020-01-01')).toBe(false);
  });

  it('allows edit only for DRAFT and RETURNED', () => {
    expect(canEditSaleStatus('DRAFT')).toBe(true);
    expect(canEditSaleStatus('RETURNED')).toBe(true);
    expect(canEditSaleStatus('SUBMITTED')).toBe(false);
  });

  it('clears incompatible employment/tax payloads by customer type', () => {
    const sale = {
      id: 's1',
      saleNumber: 'V-000001',
      version: 2,
      status: 'DRAFT',
      customerType: 'DEREGULATED',
      observations: null,
      createdAt: '2026-10-01T00:00:00.000Z',
      updatedAt: '2026-10-01T00:00:00.000Z',
      submittedAt: null,
      healthInsurer: { id: 'ins1', code: 'PREVENCION_SALUD', name: 'Prevención Salud' },
      healthPlan: null,
      seller: {
        id: 'u1',
        email: 'seller@altium.example',
        firstName: 'Sol',
        lastName: 'Ruiz',
      },
      members: [],
      contact: null,
      employment: {
        currentInsurance: 'OSDE',
        grossSalary: 1000,
        employers: [{ id: 'e1', employerCuit: '30712345678', displayOrder: 0 }],
      },
      taxInfo: { monotaxCategory: 'A', currentInsurance: 'OSDE' },
      billing: null,
    } satisfies Sale;

    const model = saleToFormModel(sale);
    model.customerType = 'VOLUNTARY';
    const body = formModelToUpdateBody(model);
    expect(body.employment).toBeNull();
    expect(body.taxInfo).toBeNull();
    expect(body.version).toBe(2);
    expect(body.billing).not.toHaveProperty('cbu');
    expect(body.billing).not.toHaveProperty('cardNumber');
    expect(body.billing).not.toHaveProperty('cvv');
  });
});

describe('team payloads', () => {
  const team: Team = {
    id: 't1',
    name: 'Norte',
    description: 'Zona norte',
    isActive: true,
    activeMemberCount: 2,
    createdAt: '2026-10-01T00:00:00.000Z',
    updatedAt: '2026-10-01T00:00:00.000Z',
    supervisor: { id: 's1', email: 's@altium.example', firstName: 'Sol', lastName: 'Ruiz' },
  };

  it('omits empty description on create', () => {
    expect(
      toCreateTeamBody({ name: 'Sur', description: '', supervisorId: 's1', isActive: true }),
    ).toEqual({ name: 'Sur', supervisorId: 's1' });
  });

  it('sends only changed fields and null to clear description', () => {
    expect(
      toUpdateTeamBody(team, {
        name: 'Norte',
        description: '',
        supervisorId: 's2',
        isActive: false,
      }),
    ).toEqual({ supervisorId: 's2', isActive: false, description: null });
    expect(
      toUpdateTeamBody(team, {
        name: 'Norte',
        description: 'Zona norte',
        supervisorId: 's1',
        isActive: true,
      }),
    ).toEqual({});
  });
});
