import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { SaleDocuments } from '@/services/http';
import { emptyMember, type SaleFormModel } from './sale-form-model';
import { getSaleReadiness } from './sale-readiness';

const docs: SaleDocuments = {
  items: [],
  storageIntegrationPending: false,
  requiredCategories: [
    { documentType: 'DNI_FRONT', saleMemberId: null, label: 'DNI frente', satisfied: true },
  ],
};
function completeModel(): SaleFormModel {
  return {
    version: 1,
    healthInsurerId: 'insurer',
    healthPlanId: 'plan',
    customerType: 'VOLUNTARY',
    observations: null,
    members: [
      {
        ...emptyMember('HOLDER'),
        cuil: '20123456786',
        firstName: 'Ana',
        lastName: 'Pérez',
        sex: 'MALE',
        birthDate: '1990-05-10',
        nationality: 'Argentino',
        maritalStatus: 'SINGLE',
        weightKg: 60,
        heightCm: 165,
      },
    ],
    contact: {
      areaCode: '11',
      phone: '55554444',
      email: 'ana@example.com',
      address: 'Calle 123',
      postalCode: '1000',
      province: 'CABA',
    },
    employment: { currentInsurance: null, grossSalary: null, employers: [] },
    taxInfo: { monotaxCategory: null, currentInsurance: null },
    billing: { paymentMethod: 'CBU', holderIsPayer: true, paymentMedium: 'alias.cuenta' },
  };
}
describe('sale presentation readiness', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-26T15:00:00Z'));
  });
  afterEach(() => vi.useRealTimers());
  it('allows a complete voluntary sale, with optional observations empty and No as a valid answer', () => {
    const state = getSaleReadiness(completeModel(), docs);
    expect(state.ready).toBe(true);
    expect(state.percent).toBe(100);
    expect(state.bySection.notes.total).toBe(0);
    expect(state.bySection.employment.total).toBe(0);
  });
  it('blocks missing or unavailable documents even when every field is complete', () => {
    expect(getSaleReadiness(completeModel()).ready).toBe(false);
    expect(
      getSaleReadiness(completeModel(), {
        ...docs,
        requiredCategories: [{ ...docs.requiredCategories[0]!, satisfied: false }],
      }).pending.map((item) => item.section),
    ).toEqual(['documents']);
  });
  it('counts every added member and only requests FUM above age 12', () => {
    const model = completeModel();
    model.members.push({
      ...model.members[0]!,
      memberType: 'CHILD',
      sex: 'FEMALE',
      birthDate: '2014-10-26',
    });
    expect(getSaleReadiness(model, docs).ready).toBe(true);
    model.members[1]!.birthDate = '2013-10-26';
    expect(getSaleReadiness(model, docs).pending.map((item) => item.path)).toEqual([
      'members[1].lastMenstrualPeriod',
    ]);
    model.members[1]!.lastMenstrualPeriod = '2026-10-20';
    expect(getSaleReadiness(model, docs).ready).toBe(true);
    model.members.push(emptyMember('SPOUSE'));
    expect(getSaleReadiness(model, docs).ready).toBe(false);
    model.members.pop();
    expect(getSaleReadiness(model, docs).ready).toBe(true);
  });
  it('requires a description only when preexisting conditions are selected', () => {
    const model = completeModel();
    model.members[0]!.hasPreexistingConditions = true;
    expect(getSaleReadiness(model, docs).pending[0]?.path).toBe(
      'members[0].preexistingConditionsDetails',
    );
    model.members[0]!.preexistingConditionsDetails = 'Detalle cargado';
    expect(getSaleReadiness(model, docs).ready).toBe(true);
  });
  it('switches required employment/tax fields with the customer type', () => {
    const model = completeModel();
    model.customerType = 'DEREGULATED';
    expect(getSaleReadiness(model, docs).ready).toBe(false);
    model.employment = {
      currentInsurance: 'Obra social',
      grossSalary: 100000,
      employers: [{ employerCuit: '20123456786' }],
    };
    expect(getSaleReadiness(model, docs).ready).toBe(true);
    model.customerType = 'MONOTAX';
    expect(getSaleReadiness(model, docs).bySection.employment.total).toBe(0);
    expect(getSaleReadiness(model, docs).pending.map((item) => item.section)).toEqual([
      'tax',
      'tax',
    ]);
    model.taxInfo = { monotaxCategory: 'A', currentInsurance: 'Obra social' };
    expect(getSaleReadiness(model, docs).ready).toBe(true);
  });
  it('requires alternative payer details when the holder is not paying', () => {
    const model = completeModel();
    model.billing = { paymentMethod: 'CBU', holderIsPayer: false };
    expect(getSaleReadiness(model, docs).pending).toHaveLength(3);
    Object.assign(model.billing, {
      payerIdentifier: '20123456786',
      payerEmail: 'pago@example.com',
      payerPhone: '1122223333',
    });
    expect(getSaleReadiness(model, docs).ready).toBe(true);
  });
  it('requires full card data and a valid expiration', () => {
    const model = completeModel();
    model.billing = {
      paymentMethod: 'CARD',
      holderIsPayer: true,
      cardBrand: 'Visa',
      cardLastFour: '4242',
      cardNumber: '4242424242424242',
      cvv: '123',
      cardExpiryMonth: 10,
      cardExpiryYear: 2026,
    };
    expect(getSaleReadiness(model, docs).ready).toBe(true);
    model.billing.cardExpiryMonth = 9;
    expect(getSaleReadiness(model, docs).ready).toBe(false);
    model.billing.cardExpiryYear = 2030;
    model.billing.cardNumber = '123';
    expect(getSaleReadiness(model, docs).ready).toBe(false);
  });
  it('requires card details for a third-party payer and limits the CVV to 3 or 4 digits', () => {
    const model = completeModel();
    model.billing = {
      paymentMethod: 'CARD',
      holderIsPayer: false,
      payerIdentifier: '20123456786',
      payerEmail: 'payer@example.com',
      payerPhone: '1122223333',
      cardBrand: 'Visa',
      cardNumber: '4242424242424242',
      cvv: '1234',
      cardExpiryMonth: 12,
      cardExpiryYear: 2030,
    };
    expect(getSaleReadiness(model, docs).ready).toBe(true);
    model.billing.cvv = '12345';
    expect(getSaleReadiness(model, docs).pending.map((item) => item.path)).toContain('billing.cvv');
    model.billing.cvv = '12';
    expect(getSaleReadiness(model, docs).ready).toBe(false);
  });
  it('counts missing card images in billing, while optional OTHER never blocks submit', () => {
    const model = completeModel();
    const documents = {
      ...docs,
      requiredCategories: [
        {
          documentType: 'CARD_FRONT' as const,
          label: 'Tarjeta frente',
          saleMemberId: null,
          satisfied: false,
        },
      ],
    };
    expect(getSaleReadiness(model, documents).bySection.billing.total).toBe(4);
    expect(
      getSaleReadiness(model, documents).pending.some((item) => item.section === 'billing'),
    ).toBe(true);
    expect(getSaleReadiness(model, docs).ready).toBe(true);
  });
  it('rejects invalid emails, future dates, zero measurements and invalid tax identifiers', () => {
    const model = completeModel();
    model.contact.email = 'invalid';
    model.members[0]!.birthDate = '2030-01-01';
    model.members[0]!.weightKg = 0;
    model.members[0]!.cuil = '20123456785';
    expect(getSaleReadiness(model, docs).pending.map((item) => item.path)).toEqual(
      expect.arrayContaining([
        'contact.email',
        'members[0].birthDate',
        'members[0].weightKg',
        'members[0].cuil',
      ]),
    );
  });
});
