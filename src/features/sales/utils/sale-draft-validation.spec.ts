import { describe, expect, it } from 'vitest';
import { buildSale } from '../../../../tests/e2e/support/api-mock';
import { emptyMember, saleToFormModel } from './sale-form-model';
import { validateSaleDraft } from './sale-draft-validation';

describe('draft validation before save or navigation', () => {
  it('allows incomplete drafts without requiring presentation fields or documents', () => {
    const model = saleToFormModel(buildSale({ customerType: 'VOLUNTARY' }));
    model.members = [emptyMember('HOLDER')];
    model.contact = {};
    model.billing = {};
    expect(validateSaleDraft(model)).toEqual({});
  });
  it('reports every invalid provided field, including optional text and numeric precision', () => {
    const model = saleToFormModel(buildSale());
    model.members[0]!.cuil = '20346737751';
    model.members[0]!.birthDate = '2026-02-30';
    model.members[0]!.weightKg = 501;
    model.members[0]!.heightCm = 170.123;
    model.contact.email = 'mal';
    model.contact.areaCode = 'a';
    model.employment.employers[0]!.employerCuit = '123';
    model.employment.grossSalary = -1;
    model.billing.cardNumber = '123';
    model.billing.cvv = '1';
    model.billing.cardExpiryMonth = 13;
    model.billing.cardExpiryYear = 2000;
    model.observations = 'a'.repeat(8001);
    expect(Object.keys(validateSaleDraft(model))).toEqual(
      expect.arrayContaining([
        'members[0].cuil',
        'members[0].birthDate',
        'members[0].weightKg',
        'members[0].heightCm',
        'contact.email',
        'contact.areaCode',
        'employment.employers[0].employerCuit',
        'employment.grossSalary',
        'billing.cardNumber',
        'billing.cvv',
        'billing.cardExpiryMonth',
        'billing.cardExpiryYear',
        'observations',
      ]),
    );
  });
  it('checks other payer details and ignores inactive employment and card requirements', () => {
    const model = saleToFormModel(buildSale({ customerType: 'VOLUNTARY' }));
    model.employment.grossSalary = -1;
    model.billing = {
      paymentMethod: 'CBU',
      holderIsPayer: false,
      payerIdentifier: '123',
      payerEmail: 'mal',
    };
    expect(Object.keys(validateSaleDraft(model))).toEqual([
      'billing.payerIdentifier',
      'billing.payerEmail',
    ]);
    model.billing.payerIdentifier = '20123456786';
    model.billing.payerEmail = 'valid@example.com';
    expect(validateSaleDraft(model)).toEqual({});
  });
});
