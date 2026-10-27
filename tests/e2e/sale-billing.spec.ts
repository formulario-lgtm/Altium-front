import { expect, test, type Page } from '@playwright/test';
import type { SaleDocuments, UpdateSaleBody } from '../../src/services/http';
import {
  ADMINISTRATIVE_PERMISSIONS,
  buildSale,
  mockApi,
  SELLER_PERMISSIONS,
} from './support/api-mock';

async function setup(page: Page, bankPayment = false) {
  await mockApi(page, { authenticated: true, permissions: SELLER_PERMISSIONS });
  let sale = buildSale();
  if (bankPayment)
    sale.billing = {
      ...sale.billing!,
      paymentMethod: 'CBU',
      paymentMedium: null,
      cardNumber: null,
      cvv: null,
      cardBrand: null,
      cardLastFour: null,
      cardExpiryMonth: null,
      cardExpiryYear: null,
    };
  const documents: SaleDocuments = {
    items: [],
    storageIntegrationPending: false,
    requiredCategories: [
      { documentType: 'DNI_FRONT', label: 'DNI frente', saleMemberId: null, satisfied: true },
      {
        documentType: 'CARD_FRONT',
        label: 'Tarjeta de crédito · Frente',
        saleMemberId: null,
        satisfied: false,
      },
      {
        documentType: 'CARD_BACK',
        label: 'Tarjeta de crédito · Dorso',
        saleMemberId: null,
        satisfied: false,
      },
    ],
  };
  let lastBody: UpdateSaleBody | undefined;
  await page.route(`**/api/v1/sales/${sale.id}`, async (route) => {
    if (route.request().method() === 'PATCH') {
      lastBody = route.request().postDataJSON() as UpdateSaleBody;
      sale = {
        ...sale,
        version: sale.version + 1,
        billing: { ...sale.billing!, ...lastBody.billing },
      };
    }
    await route.fulfill({ json: sale });
  });
  await page.route(`**/api/v1/sales/${sale.id}/documents`, async (route) => {
    if (route.request().method() === 'POST') {
      const multipart = route.request().postDataBuffer()!.toString();
      const documentType = ['CARD_FRONT', 'CARD_BACK', 'OTHER'].find((type) =>
        multipart.includes(`\r\n\r\n${type}\r\n`),
      ) as 'CARD_FRONT' | 'CARD_BACK' | 'OTHER';
      expect(documentType).toBeTruthy();
      const doc = {
        id: `doc-${documentType}`,
        documentType,
        saleMemberId: null,
        originalFilename: `${documentType}.png`,
        status: 'UPLOADED' as const,
        mimeType: 'image/png',
        fileSize: 68,
        createdAt: '2026-10-27T15:00:00Z',
      };
      documents.items.push(doc);
      const required = documents.requiredCategories.find(
        (category) => category.documentType === documentType,
      );
      if (required) required.satisfied = true;
      return route.fulfill({ status: 201, json: doc });
    }
    return route.fulfill({ json: documents });
  });
  return { id: sale.id, documents, lastBody: () => lastBody };
}
async function section(page: Page, label: string) {
  await expect(page.getByTestId('sale-completion')).toBeVisible();
  const nav = page.getByRole('navigation', { name: 'Secciones de la venta' });
  if (await nav.isVisible()) await nav.getByText(label, { exact: true }).click();
  else {
    await page.getByLabel('Sección', { exact: true }).locator('..').click();
    await page.getByRole('option', { name: label, exact: true }).click();
  }
  await expect(page.getByTestId('global-loading')).toHaveCount(0);
}
const image = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j8msAAAAASUVORK5CYII=',
  'base64',
);
for (const mobile of [false, true]) {
  test(`billing saves full card data and both images; optional documents stay separate (${mobile ? 'mobile' : 'desktop'})`, async ({
    page,
  }, testInfo) => {
    await page.setViewportSize(
      mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 },
    );
    const state = await setup(page);
    await page.goto(`/sales/${state.id}/edit`);
    if (mobile) await page.getByRole('button', { name: 'Cambiar a tema claro' }).click();
    await section(page, 'Cobranza y facturación');
    const payer = await page
      .getByLabel('¿El titular es el pagador? *', { exact: true })
      .boundingBox();
    const method = await page.getByLabel('Forma de pago *', { exact: true }).boundingBox();
    expect(payer!.y <= method!.y).toBe(true);
    if (!mobile) expect(payer!.x < method!.x).toBe(true);
    const number = page.getByLabel('Número de tarjeta *', { exact: true });
    const cvv = page.getByLabel('CVV / CVC *', { exact: true });
    await expect(number).toHaveAttribute('type', 'text');
    await expect(number).toHaveAttribute('autocomplete', 'section-sale-billing cc-number');
    await expect(number).toHaveCSS('-webkit-text-security', 'disc');
    await expect(cvv).toHaveAttribute('type', 'text');
    await expect(cvv).toHaveAttribute('autocomplete', 'section-sale-billing cc-csc');
    await expect(cvv).toHaveCSS('-webkit-text-security', 'disc');
    await expect(cvv).toHaveAttribute('maxlength', '4');
    await number.fill('5555555555554444');
    await cvv.fill('1234');
    await page.getByRole('button', { name: 'Guardar borrador', exact: true }).click();
    await expect.poll(() => state.lastBody()?.billing?.cardNumber).toBe('5555555555554444');
    await expect.poll(() => state.lastBody()?.billing?.cvv).toBe('1234');
    for (const type of ['CARD_FRONT', 'CARD_BACK'] as const) {
      const card = page.getByTestId(`sale-document-${type}:sale`);
      await expect(card).toBeVisible();
      const chooser = page.waitForEvent('filechooser');
      await card.getByRole('button', { name: 'Subir archivo' }).click();
      await (await chooser).setFiles({ name: `${type}.png`, mimeType: 'image/png', buffer: image });
      await expect(card).toContainText(`${type}.png`);
    }
    await page.reload();
    await section(page, 'Cobranza y facturación');
    await expect(number).toHaveValue('5555555555554444');
    await expect(cvv).toHaveValue('1234');
    await expect(page.getByTestId('sale-document-CARD_FRONT:sale')).toContainText('CARD_FRONT.png');
    await expect(page.getByTestId('sale-document-CARD_BACK:sale')).toContainText('CARD_BACK.png');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: testInfo.outputPath('billing.png'), fullPage: true });
    await section(page, 'Documentación');
    await expect(page.getByTestId('sale-document-CARD_FRONT:sale')).toHaveCount(0);
    const extra = page.getByTestId('sale-document-OTHER:sale');
    await expect(extra).toContainText('Otra documentación');
    await expect(extra).toContainText('Opcional');
    const chooser = page.waitForEvent('filechooser');
    await extra.getByRole('button', { name: 'Subir archivo' }).click();
    await (await chooser).setFiles({ name: 'extra.png', mimeType: 'image/png', buffer: image });
    await expect(extra).toContainText('OTHER.png');
    expect(state.documents.items.map((doc) => doc.documentType)).toEqual([
      'CARD_FRONT',
      'CARD_BACK',
      'OTHER',
    ]);
  });
}

test('administrative can explicitly reveal and hide complete card data', async ({ page }) => {
  await mockApi(page, { authenticated: true, permissions: ADMINISTRATIVE_PERMISSIONS });
  const sale = buildSale({ status: 'IN_REVIEW' });
  await page.goto(`/administrative/sales/${sale.id}?section=billing`);
  const panel = page.getByTestId('admin-sale-billing');
  await expect(panel).not.toContainText('4242424242424242');
  await panel.getByRole('button', { name: 'Mostrar datos de tarjeta' }).click();
  await expect(panel).toContainText('4242424242424242');
  await panel.getByRole('button', { name: 'Ocultar datos de tarjeta' }).click();
  await expect(panel).not.toContainText('4242424242424242');
});

test('bank reference starts empty, opts out of login autofill and preserves a saved alias', async ({
  page,
}) => {
  const state = await setup(page, true);
  await page.goto(`/sales/${state.id}/edit`);
  await section(page, 'Cobranza y facturación');
  const bank = page.getByLabel('CBU/CVU/ALIAS *', { exact: true });
  await expect(bank).toHaveValue('');
  await expect(bank).toHaveAttribute('name', 'sale-billing-bank-reference');
  await expect(bank).toHaveAttribute('autocomplete', 'off');
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
  await bank.fill('alias.cuenta.real');
  await page.getByRole('button', { name: 'Guardar borrador', exact: true }).click();
  await expect.poll(() => state.lastBody()?.billing?.paymentMedium).toBe('alias.cuenta.real');
  await page.reload();
  await section(page, 'Cobranza y facturación');
  await expect(bank).toHaveValue('alias.cuenta.real');
});
