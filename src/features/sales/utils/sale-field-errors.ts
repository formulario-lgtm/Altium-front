/** Lookup helpers for Problem Details field paths like `members[0].cuil`. */

export function fieldError(
  errors: Readonly<Record<string, string>>,
  path: string,
): string | undefined {
  return errors[path] || undefined;
}

export function memberFieldError(
  errors: Readonly<Record<string, string>>,
  index: number,
  key: string,
): string | undefined {
  return (
    fieldError(errors, `members[${index}].${key}`) ?? fieldError(errors, `members.${index}.${key}`)
  );
}

/** Vuetify outlined field error bindings. */
export function fieldErrorProps(
  errors: Readonly<Record<string, string>>,
  path: string,
): { error: boolean; 'error-messages': string[] } {
  const message = fieldError(errors, path);
  return {
    error: Boolean(message),
    'error-messages': message ? [message] : [],
  };
}

export function memberFieldErrorProps(
  errors: Readonly<Record<string, string>>,
  index: number,
  key: string,
): { error: boolean; 'error-messages': string[] } {
  const message = memberFieldError(errors, index, key);
  return {
    error: Boolean(message),
    'error-messages': message ? [message] : [],
  };
}

/** Friendlier labels for the submit error summary list. */
export function saleFieldPathLabel(path: string): string {
  const member = /^members\[(\d+)\]\.(.+)$/.exec(path);
  if (member) {
    const index = Number(member[1]);
    const key = member[2] ?? '';
    const who = index === 0 ? 'Titular' : `Integrante ${index + 1}`;
    return `${who} · ${memberKeyLabel(key)}`;
  }
  const employer = /^employment\.employers\[(\d+)\]\.employerCuit$/.exec(path);
  if (employer) {
    return `CUIT empleador ${Number(employer[1]) + 1}`;
  }

  const known: Record<string, string> = {
    healthInsurerId: 'Prepaga',
    healthPlanId: 'Plan',
    customerType: 'Tipo de venta',
    members: 'Integrantes',
    'contact.areaCode': 'Código de área',
    'contact.phone': 'Teléfono',
    'contact.email': 'Correo',
    'contact.address': 'Domicilio',
    'contact.postalCode': 'Código postal',
    'contact.province': 'Provincia',
    'employment.currentInsurance': 'Obra social actual',
    'employment.grossSalary': 'Sueldo bruto',
    'taxInfo.monotaxCategory': 'Categoría de monotributo',
    'taxInfo.currentInsurance': 'Obra social actual',
    'billing.paymentMethod': 'Forma de pago',
    'billing.holderIsPayer': 'Titular pagador',
    'billing.paymentMedium': 'CBU/CVU/ALIAS',
    'billing.cardBrand': 'Marca de tarjeta',
    'billing.cardLastFour': 'Últimos 4 de tarjeta',
    'billing.cardExpiryMonth': 'Mes de vencimiento',
    'billing.cardExpiryYear': 'Año de vencimiento',
    'billing.payerIdentifier': 'CUIT / CUIL del pagador',
    'billing.payerEmail': 'Email del pagador',
    'billing.payerPhone': 'Teléfono del pagador',
    documents: 'Documentación',
  };
  return known[path] ?? path;
}

function memberKeyLabel(key: string): string {
  const labels: Record<string, string> = {
    cuil: 'CUIL',
    firstName: 'Nombre',
    lastName: 'Apellido',
    sex: 'Sexo',
    birthDate: 'Fecha de nacimiento',
    nationality: 'Nacionalidad',
    maritalStatus: 'Estado civil',
    weightKg: 'Peso',
    heightCm: 'Altura',
    lastMenstrualPeriod: 'FUM',
    preexistingConditionsDetails: 'Preexistencias',
    hasPreexistingConditions: 'Preexistencias',
  };
  return labels[key] ?? key;
}
