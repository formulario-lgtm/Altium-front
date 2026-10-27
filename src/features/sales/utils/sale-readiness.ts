import { z } from 'zod';
import type { SaleDocuments } from '@/services/http';
import type { SaleSectionId } from '../components/SaleSectionNav.vue';
import type { SaleFormModel } from './sale-form-model';
import { saleFieldPathLabel } from './sale-field-errors';
import { ageFromBirthDate, showFum } from './sale-labels';

export type SaleRequirement = {
  path: string;
  label: string;
  section: SaleSectionId;
  valid: boolean;
};
export type SectionCompletion = { complete: number; total: number };
const text = (value: unknown) => z.string().trim().min(1).safeParse(value).success;
const email = (value: unknown) => z.string().trim().email().safeParse(value).success;
const positive = (value: unknown) => z.number().finite().positive().safeParse(value).success;

/** Same check digit as the API; incomplete drafts remain saveable. */
export function isValidSaleTaxId(value: unknown): boolean {
  if (typeof value !== 'string' || !/^\d{11}$/.test(value)) return false;
  const sum = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2].reduce(
    (total, factor, index) => total + Number(value[index]) * factor,
    0,
  );
  const mod = sum % 11;
  return Number(value[10]) === (mod === 0 ? 0 : mod === 1 ? 9 : 11 - mod);
}

function pastDate(value: unknown): boolean {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return (
    !Number.isNaN(date.getTime()) &&
    date.getFullYear() === Number(value.slice(0, 4)) &&
    date.getMonth() + 1 === Number(value.slice(5, 7)) &&
    date.getDate() === Number(value.slice(8, 10)) &&
    ageFromBirthDate(value) != null
  );
}

/** Required fields from the reference form, conditional on the active sale/family/payment. */
export function getSaleReadiness(model: SaleFormModel | null, documents?: SaleDocuments) {
  const requirements: SaleRequirement[] = [];
  const add = (
    section: SaleSectionId,
    path: string,
    value: unknown,
    validate: (value: unknown) => boolean = text,
    label = saleFieldPathLabel(path),
  ) => requirements.push({ section, path, label, valid: validate(value) });
  if (model) {
    add('details', 'healthInsurerId', model.healthInsurerId);
    add('details', 'customerType', model.customerType);
    add('details', 'healthPlanId', model.healthPlanId);
    add(
      'members',
      'members',
      model.members.filter((member) => member.memberType === 'HOLDER').length,
      (value) => value === 1,
      'Un titular en la venta',
    );
    model.members.forEach((member, index) => {
      const path = `members[${index}]`;
      add('members', `${path}.cuil`, member.cuil, isValidSaleTaxId);
      add('members', `${path}.firstName`, member.firstName);
      add('members', `${path}.lastName`, member.lastName);
      add('members', `${path}.sex`, member.sex);
      add('members', `${path}.birthDate`, member.birthDate, pastDate);
      add('members', `${path}.nationality`, member.nationality);
      if (member.memberType === 'HOLDER')
        add('members', `${path}.maritalStatus`, member.maritalStatus);
      add(
        'members',
        `${path}.weightKg`,
        member.weightKg,
        (value) => positive(value) && Number(value) >= 0.1,
      );
      add(
        'members',
        `${path}.heightCm`,
        member.heightCm,
        (value) => positive(value) && Number(value) >= 1 && Number(value) <= 300,
      );
      add(
        'members',
        `${path}.hasPreexistingConditions`,
        member.hasPreexistingConditions,
        (value) => z.boolean().safeParse(value).success,
      );
      if (showFum(member.sex, member.birthDate))
        add('members', `${path}.lastMenstrualPeriod`, member.lastMenstrualPeriod, pastDate);
      if (member.hasPreexistingConditions)
        add('members', `${path}.preexistingConditionsDetails`, member.preexistingConditionsDetails);
    });
    add(
      'contact',
      'contact.areaCode',
      model.contact.areaCode,
      (value) =>
        z
          .string()
          .regex(/^\d{2,5}$/)
          .safeParse(value).success,
    );
    add('contact', 'contact.phone', model.contact.phone);
    add('contact', 'contact.email', model.contact.email, email);
    add('contact', 'contact.address', model.contact.address);
    add('contact', 'contact.postalCode', model.contact.postalCode);
    add('contact', 'contact.province', model.contact.province);
    if (model.customerType === 'DEREGULATED') {
      add(
        'employment',
        'employment.employers',
        model.employment.employers.length,
        (value) => Number(value) > 0,
        'Al menos un CUIT de empleador',
      );
      model.employment.employers.forEach((employer, index) =>
        add(
          'employment',
          `employment.employers[${index}].employerCuit`,
          employer.employerCuit,
          isValidSaleTaxId,
        ),
      );
      add('employment', 'employment.currentInsurance', model.employment.currentInsurance);
      add('employment', 'employment.grossSalary', model.employment.grossSalary, positive);
    }
    if (model.customerType === 'MONOTAX') {
      add('tax', 'taxInfo.monotaxCategory', model.taxInfo.monotaxCategory);
      add('tax', 'taxInfo.currentInsurance', model.taxInfo.currentInsurance);
    }
    const billing = model.billing;
    add('billing', 'billing.paymentMethod', billing.paymentMethod);
    add(
      'billing',
      'billing.holderIsPayer',
      billing.holderIsPayer,
      (value) => z.boolean().safeParse(value).success,
    );
    if (billing.holderIsPayer === true) {
      if (billing.paymentMethod === 'CBU')
        add('billing', 'billing.paymentMedium', billing.paymentMedium);
    } else if (billing.holderIsPayer === false) {
      add('billing', 'billing.payerIdentifier', billing.payerIdentifier, isValidSaleTaxId);
      add('billing', 'billing.payerEmail', billing.payerEmail, email);
      add('billing', 'billing.payerPhone', billing.payerPhone);
    }
    if (billing.paymentMethod === 'CARD') {
      add('billing', 'billing.cardBrand', billing.cardBrand);
      add(
        'billing',
        'billing.cardNumber',
        billing.cardNumber,
        (value) =>
          z
            .string()
            .regex(/^\d{13,19}$/)
            .safeParse(value).success,
      );
      add(
        'billing',
        'billing.cvv',
        billing.cvv,
        (value) =>
          z
            .string()
            .regex(/^\d{3,4}$/)
            .safeParse(value).success,
      );
      add(
        'billing',
        'billing.cardExpiryMonth',
        billing.cardExpiryMonth,
        (value) => z.number().int().min(1).max(12).safeParse(value).success,
      );
      const now = new Date();
      add(
        'billing',
        'billing.cardExpiryYear',
        billing.cardExpiryYear,
        (value) =>
          z.number().int().min(now.getFullYear()).max(2100).safeParse(value).success &&
          (Number(value) > now.getFullYear() ||
            Number(billing.cardExpiryMonth) >= now.getMonth() + 1),
      );
    }
  }
  if (!documents)
    add('documents', 'documents', null, () => false, 'Verificar documentación requerida');
  else
    documents.requiredCategories.forEach((category, index) =>
      add(
        ['CARD_FRONT', 'CARD_BACK'].includes(category.documentType) ? 'billing' : 'documents',
        `documents.${index}`,
        category.satisfied,
        (value) => value === true,
        category.label,
      ),
    );
  const pending = requirements.filter((requirement) => !requirement.valid);
  const complete = requirements.length - pending.length;
  const bySection = Object.fromEntries(
    ['details', 'members', 'contact', 'employment', 'tax', 'billing', 'documents', 'notes'].map(
      (id) => {
        const items = requirements.filter((requirement) => requirement.section === id);
        return [
          id,
          {
            total: items.length,
            complete: items.filter((requirement) => requirement.valid).length,
          },
        ];
      },
    ),
  ) as Record<SaleSectionId, SectionCompletion>;
  return {
    requirements,
    pending,
    complete,
    total: requirements.length,
    percent: requirements.length ? Math.round((complete / requirements.length) * 100) : 0,
    ready: Boolean(model) && pending.length === 0,
    bySection,
  };
}
