import { expect, test } from '@playwright/test';
import type { SaleDocuments } from '../../src/services/http';
import { ADMINISTRATIVE_PERMISSIONS, buildSale, mockApi } from './support/api-mock';

test('documents identify the family member and expose uploaded file metadata', async ({ page }) => {
  await mockApi(page, { authenticated: true, permissions: ADMINISTRATIVE_PERMISSIONS });
  const sale = buildSale({ status: 'IN_REVIEW' });
  const documents: SaleDocuments = {
    storageIntegrationPending: false,
    requiredCategories: [],
    items: [
      {
        id: 'document-1',
        documentType: 'DNI_FRONT',
        saleMemberId: sale.members[0]!.id,
        status: 'UPLOADED',
        originalFilename: 'documento-del-titular.pdf',
        createdAt: '2026-10-26T12:00:00Z',
        fileSize: 1024,
        mimeType: 'application/pdf',
      },
    ],
  };
  await page.route(`**/api/v1/sales/${sale.id}`, (route) => route.fulfill({ json: sale }));
  await page.route(`**/api/v1/sales/${sale.id}/documents`, (route) =>
    route.fulfill({ json: documents }),
  );
  await page.goto(`/administrative/sales/${sale.id}?section=documents`);
  const panel = page.getByTestId('sale-detail-documents');
  await expect(panel).toContainText('DNI frente · Titular · Ana Pérez');
  await expect(panel).toContainText('Estado: Subido');
  await expect(panel).toContainText('1.0 KB');
  await expect(
    panel.getByRole('button', { name: 'Descargar documento-del-titular.pdf', exact: true }),
  ).toBeVisible();
});

test('administrative can read full personal and medical data for every family member', async ({
  page,
}) => {
  await mockApi(page, { authenticated: true, permissions: ADMINISTRATIVE_PERMISSIONS });
  const sale = buildSale({ status: 'IN_REVIEW' });
  sale.members = [
    {
      ...sale.members[0]!,
      lastMenstrualPeriod: '2026-10-01',
      hasPreexistingConditions: true,
      preexistingConditionsDetails: 'Tratamiento indicado por especialista.',
    },
    {
      ...sale.members[0]!,
      id: 'spouse-1',
      memberType: 'SPOUSE',
      firstName: 'Pedro',
      lastName: 'Pérez',
      sex: 'MALE',
      hasPreexistingConditions: false,
    },
    {
      ...sale.members[0]!,
      id: 'child-1',
      memberType: 'CHILD',
      firstName: 'Sofía',
      lastName: 'Pérez',
      birthDate: '2020-05-10',
      age: 6,
      weightKg: 20,
      heightCm: 110,
      hasPreexistingConditions: false,
    },
  ];
  await page.route(`**/api/v1/sales/${sale.id}`, (route) => route.fulfill({ json: sale }));
  await page.goto(`/administrative/sales/${sale.id}?section=members`);
  const members = page.getByTestId('admin-sale-member');
  await expect(members).toHaveCount(3);
  await expect(members.first()).toContainText('Tratamiento indicado por especialista.');
  await expect(members.first().locator('dt')).toHaveText([
    'Nombre',
    'Apellido',
    'CUIL',
    'Fecha de nacimiento',
    'Edad',
    'Sexo',
    'Nacionalidad',
    'Estado civil',
    'Peso',
    'Altura',
    'Fecha de última menstruación (FUM)',
    'Preexistencias',
    'Detalle de preexistencias',
  ]);
  await expect(members.first().locator('dd')).toContainText([
    'Ana',
    'Pérez',
    '27301234568',
    '10/05/1990',
    '36 años',
    'Femenino',
    'Argentino',
    'Soltero/a',
    '60 kg',
    '165 cm',
    '01/10/2026',
    'Sí',
    'Tratamiento indicado por especialista.',
  ]);
  await expect(members.nth(1)).toContainText('Pedro Pérez');
  await expect(members.nth(1).locator('dd').last()).toHaveText('No');
  await expect(members.nth(2)).toContainText('Sofía Pérez');
  await expect(members.nth(2)).toContainText('20 kg');
  await expect(
    page.getByText('Los detalles clínicos sensibles no se destacan en esta vista de revisión.'),
  ).toHaveCount(0);
});

test('billing includes card expiration, alternative payer and payment reference', async ({
  page,
}) => {
  await mockApi(page, { authenticated: true, permissions: ADMINISTRATIVE_PERMISSIONS });
  const sale = buildSale({ status: 'IN_REVIEW' });
  sale.billing = {
    ...sale.billing!,
    holderIsPayer: false,
    payerIdentifier: '20123456786',
    payerEmail: 'pagador@example.test',
    payerPhone: '1155556666',
    paymentProviderReference: 'REF-123',
  };
  await page.route(`**/api/v1/sales/${sale.id}`, (route) => route.fulfill({ json: sale }));
  await page.goto(`/administrative/sales/${sale.id}?section=billing`);
  const billing = page.getByTestId('admin-sale-billing');
  await expect(billing.locator('dt')).toContainText([
    'Forma de pago',
    'El titular es el pagador',
    'Medio de cobro registrado',
    'Marca de tarjeta',
    'Últimos 4 dígitos',
    'Mes de vencimiento',
    'Año de vencimiento',
    'CUIL / CUIT del pagador',
    'Correo del pagador',
    'Teléfono del pagador',
    'Referencia del proveedor de pago',
  ]);
  await expect(billing).toContainText('•••• 4242');
  await expect(billing).toContainText('2030');
  await expect(billing).toContainText('pagador@example.test');
  await expect(billing).toContainText('20123456786');
  await expect(billing).toContainText('1155556666');
  await expect(billing).toContainText('REF-123');
});

for (const customerType of ['DEREGULATED', 'MONOTAX'] as const) {
  test(`missing ${customerType} data remains visible for verification`, async ({ page }) => {
    await mockApi(page, { authenticated: true, permissions: ADMINISTRATIVE_PERMISSIONS });
    const sale = buildSale({ status: 'IN_REVIEW', customerType, employment: null, taxInfo: null });
    await page.route(`**/api/v1/sales/${sale.id}`, (route) => route.fulfill({ json: sale }));
    await page.goto(`/administrative/sales/${sale.id}?section=employment`);
    const employment = page.getByTestId('admin-sale-employment');
    await expect(employment).toBeVisible();
    await expect(employment.locator('dt')).toHaveText(
      customerType === 'DEREGULATED'
        ? ['CUIT empleador', 'Obra social actual', 'Sueldo bruto (sin aporte)']
        : ['Categoría de monotributo', 'Obra social actual'],
    );
    await expect(employment.locator('dd').first()).toHaveText('Sin completar');
  });
}

test('all employer CUITs and multiline seller observations remain available', async ({ page }) => {
  await mockApi(page, { authenticated: true, permissions: ADMINISTRATIVE_PERMISSIONS });
  const sale = buildSale({
    status: 'IN_REVIEW',
    observations: 'Primera observación.\nSegunda observación para la prepaga.',
  });
  sale.employment!.employers.push({
    id: 'employer-2',
    employerCuit: '30709876543',
    displayOrder: 1,
  });
  await page.route(`**/api/v1/sales/${sale.id}`, (route) => route.fulfill({ json: sale }));
  await page.goto(`/administrative/sales/${sale.id}?section=employment`);
  await expect(page.getByTestId('admin-sale-employment')).toContainText('30712345671');
  await expect(page.getByTestId('admin-sale-employment')).toContainText('30709876543');
  await page.goto(`/administrative/sales/${sale.id}?section=details`);
  await expect(page.getByTestId('admin-sale-details')).toContainText(
    'Segunda observación para la prepaga.',
  );
});
