import type { SaleFormModel } from './sale-form-model';
import { getSaleReadiness } from './sale-readiness';

/** Validate provided values only: missing requirements still belong to presentation. */
export function validateSaleDraft(model: SaleFormModel): Record<string, string> {
  const errors: Record<string, string> = {};
  const requirements = getSaleReadiness(model).requirements.filter(
    ({ path }) =>
      path !== 'members' && !path.startsWith('documents') && path !== 'employment.employers',
  );
  for (const requirement of requirements) {
    if (requirement.supplied && !requirement.valid) {
      const path = requirement.path;
      errors[path] =
        path.endsWith('.cuil') ||
        path.endsWith('.employerCuit') ||
        path.endsWith('.payerIdentifier')
          ? 'Ingresá un CUIL/CUIT válido de 11 dígitos, con dígito verificador correcto.'
          : invalidValueMessage(path);
    }
  }
  // Match API string limits, including optional text outside presentation requirements.
  const limits: Record<string, number> = {
    firstName: 100,
    lastName: 100,
    nationality: 100,
    preexistingConditionsDetails: 4000,
    phone: 30,
    email: 255,
    address: 255,
    postalCode: 20,
    province: 100,
    currentInsurance: 150,
    monotaxCategory: 20,
    paymentMedium: 80,
    payerIdentifier: 80,
    payerEmail: 255,
    payerPhone: 30,
    cardBrand: 40,
    paymentProviderReference: 100,
    observations: 8000,
  };
  function visit(value: unknown, path: string): void {
    const key = path.split('.').pop()!;
    if (typeof value === 'string' && limits[key] && value.trim().length > limits[key]) {
      errors[path] = `Usá como máximo ${limits[key]} caracteres.`;
    } else if (
      typeof value === 'number' &&
      ['weightKg', 'heightCm', 'grossSalary'].includes(key) &&
      (!Number.isFinite(value) || Math.abs(value * 100 - Math.round(value * 100)) > 0.000001)
    ) {
      errors[path] = 'Ingresá un número válido con hasta 2 decimales.';
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => visit(item, `${path}[${index}]`));
    } else if (value && typeof value === 'object') {
      Object.entries(value).forEach(([name, item]) => visit(item, path ? `${path}.${name}` : name));
    }
  }
  const { employment, taxInfo, ...active } = model;
  visit(active, '');
  if (model.customerType === 'DEREGULATED') visit(employment, 'employment');
  if (model.customerType === 'MONOTAX') visit(taxInfo, 'taxInfo');
  return errors;
}

function invalidValueMessage(path: string): string {
  const key = path.split('.').pop();
  const messages: Record<string, string> = {
    email: 'Ingresá un correo electrónico válido.',
    payerEmail: 'Ingresá un correo electrónico válido.',
    birthDate: 'Ingresá una fecha válida que no sea futura.',
    lastMenstrualPeriod: 'Ingresá una fecha válida que no sea futura.',
    areaCode: 'Ingresá entre 2 y 5 dígitos.',
    weightKg: 'Ingresá un peso entre 0,1 y 500 kg.',
    heightCm: 'Ingresá una altura entre 1 y 300 cm.',
    grossSalary: 'Ingresá un sueldo mayor que cero.',
    cardNumber: 'Ingresá entre 13 y 19 dígitos.',
    cvv: 'Ingresá 3 o 4 dígitos.',
    cardExpiryMonth: 'Ingresá un mes entre 1 y 12.',
    cardExpiryYear: 'Revisá el vencimiento: la tarjeta no puede estar vencida.',
  };
  return messages[key ?? ''] ?? 'El dato ingresado no es válido. Revisá su formato y valor.';
}
